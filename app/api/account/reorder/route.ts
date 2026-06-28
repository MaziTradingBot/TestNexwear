import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const schema = z.object({ orderNumber: z.string().min(1) });

function isUsableImage(url: string | null | undefined) {
  return !!url && (url.startsWith("http") || url.startsWith("/"));
}

/**
 * Rebuilds a past order's items as cart lines, re-priced from the live catalog.
 * Unavailable (deleted/inactive/out-of-stock) items are skipped.
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Please sign in" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const order = await prisma.order.findFirst({
    where: { orderNumber: parsed.data.orderNumber, userId: session.user.id },
    include: { items: true },
  });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const productIds = [...new Set(order.items.map((i) => i.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
    include: {
      brand: { select: { name: true } },
      images: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
      variants: { select: { id: true, size: true, color: true, stock: true } },
    },
  });

  const lines: {
    productId: string;
    variantId?: string;
    slug: string;
    title: string;
    brand?: string;
    image: string;
    price: number;
    size?: string;
    color?: string;
    quantity: number;
  }[] = [];
  let skipped = 0;

  for (const item of order.items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      skipped++;
      continue;
    }

    // Re-match the variant by size/color (ids may have changed); require stock.
    const variant = product.variants.find(
      (v) => (item.size ? v.size === item.size : true) && (item.color ? v.color === item.color : true),
    );
    if (product.variants.length > 0 && (!variant || variant.stock <= 0)) {
      skipped++;
      continue;
    }

    const price = Number(product.discountPrice ?? product.price);
    const image = (isUsableImage(item.image) ? item.image : product.images[0]?.url) ?? "";

    lines.push({
      productId: product.id,
      variantId: variant?.id,
      slug: product.slug,
      title: product.title,
      brand: product.brand?.name,
      image,
      price,
      size: item.size ?? undefined,
      color: item.color ?? undefined,
      quantity: item.quantity,
    });
  }

  return NextResponse.json({ lines, skipped });
}
