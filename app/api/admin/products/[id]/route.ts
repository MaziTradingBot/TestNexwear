import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { guardAdminApi } from "@/lib/admin";
import { slugify } from "@/lib/slug";
import { productInput } from "@/lib/validations/product";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const denied = await guardAdminApi();
  if (denied) return denied;

  const body = await req.json().catch(() => null);
  const parsed = productInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid product" }, { status: 400 });
  }
  const d = parsed.data;

  const existing = await prisma.product.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const category = await prisma.category.findUnique({ where: { id: d.categoryId } });
  if (!category) return NextResponse.json({ error: "Category not found" }, { status: 400 });

  try {
    await prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({ where: { productId: params.id } });
      await tx.productVariant.deleteMany({ where: { productId: params.id } });
      await tx.product.update({
        where: { id: params.id },
        data: {
          title: d.title,
          description: d.description,
          brandId: d.brandId,
          categoryId: d.categoryId,
          department: category.department,
          sku: d.sku?.trim() || existing.sku,
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
              sku: `${existing.sku}-${slugify(v.color)}-${slugify(v.size)}-${i}`,
              size: v.size,
              color: v.color,
              colorHex: v.colorHex ?? null,
              stock: v.stock,
            })),
          },
        },
      });
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("PATCH /api/admin/products/[id]", e);
    return NextResponse.json({ error: "Could not update product" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const denied = await guardAdminApi();
  if (denied) return denied;
  try {
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/admin/products/[id]", e);
    return NextResponse.json({ error: "Could not delete product" }, { status: 500 });
  }
}
