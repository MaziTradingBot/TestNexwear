import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { guardAdminApi } from "@/lib/admin";
import { slugify } from "@/lib/slug";
import { productInput } from "@/lib/validations/product";
import { notifyRestock } from "@/lib/stock-notify";

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

  // Detect a sold-out → in-stock transition so we can notify the waitlist.
  const prevAgg = await prisma.productVariant.aggregate({
    where: { productId: params.id },
    _sum: { stock: true },
  });
  const prevStock = Number(prevAgg._sum.stock ?? 0);
  const newStock = d.variants.reduce((s, v) => s + v.stock, 0);

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
    revalidateTag("catalog");

    // Restocked? Email the back-in-stock waitlist (non-blocking).
    if (prevStock <= 0 && newStock > 0) {
      void notifyRestock(params.id);
    }

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
    revalidateTag("catalog");
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/admin/products/[id]", e);
    return NextResponse.json({ error: "Could not delete product" }, { status: 500 });
  }
}
