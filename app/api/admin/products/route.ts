import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { guardAdminApi } from "@/lib/admin";
import { slugify, randomSuffix } from "@/lib/slug";
import { productInput } from "@/lib/validations/product";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const denied = await guardAdminApi();
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const products = await prisma.product.findMany({
    where: q
      ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { sku: { contains: q, mode: "insensitive" } }] }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { brand: { select: { name: true } }, category: { select: { name: true } }, _count: { select: { variants: true } } },
  });
  return NextResponse.json({
    products: products.map((p) => ({
      id: p.id,
      title: p.title,
      sku: p.sku,
      brand: p.brand.name,
      category: p.category.name,
      price: Number(p.price),
      discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
      isActive: p.isActive,
      variants: p._count.variants,
    })),
  });
}

export async function POST(req: Request) {
  const denied = await guardAdminApi();
  if (denied) return denied;

  const body = await req.json().catch(() => null);
  const parsed = productInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid product" }, { status: 400 });
  }
  const d = parsed.data;

  const category = await prisma.category.findUnique({ where: { id: d.categoryId } });
  if (!category) return NextResponse.json({ error: "Category not found" }, { status: 400 });

  const sku = (d.sku?.trim() || `NX-${randomSuffix(8).toUpperCase()}`);
  const slug = `${slugify(d.title)}-${randomSuffix()}`;

  try {
    const product = await prisma.product.create({
      data: {
        slug,
        sku,
        title: d.title,
        description: d.description,
        brandId: d.brandId,
        categoryId: d.categoryId,
        department: category.department,
        price: new Prisma.Decimal(d.price),
        discountPrice: d.discountPrice != null ? new Prisma.Decimal(d.discountPrice) : null,
        material: d.material ?? null,
        collection: d.collection ?? null,
        isActive: d.isActive ?? true,
        isFeatured: d.isFeatured ?? false,
        isNewArrival: d.isNewArrival ?? false,
        images: { create: d.images.map((url, i) => ({ url, position: i, altText: d.title })) },
        variants: {
          create: d.variants.map((v, i) => ({
            sku: `${sku}-${slugify(v.color)}-${slugify(v.size)}-${i}`,
            size: v.size,
            color: v.color,
            colorHex: v.colorHex ?? null,
            stock: v.stock,
          })),
        },
      },
    });
    revalidateTag("catalog");
    return NextResponse.json({ id: product.id });
  } catch (e) {
    console.error("POST /api/admin/products", e);
    return NextResponse.json({ error: "Could not create product" }, { status: 500 });
  }
}
