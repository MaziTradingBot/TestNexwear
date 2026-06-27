import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { guardAdminApi } from "@/lib/admin";

export const dynamic = "force-dynamic";

/** Recompute a product's denormalised rating/reviewCount from its approved reviews. */
async function recomputeRating(productId: string) {
  const agg = await prisma.review.aggregate({
    where: { productId, isApproved: true },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: new Prisma.Decimal((agg._avg.rating ?? 0).toFixed(2)),
      reviewCount: agg._count,
    },
  });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const denied = await guardAdminApi();
  if (denied) return denied;

  const parsed = z.object({ isApproved: z.boolean() }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  try {
    const review = await prisma.review.update({
      where: { id: params.id },
      data: { isApproved: parsed.data.isApproved },
    });
    await recomputeRating(review.productId);
    revalidateTag("catalog");
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("PATCH /api/admin/reviews/[id]", e);
    return NextResponse.json({ error: "Could not update review" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const denied = await guardAdminApi();
  if (denied) return denied;

  try {
    const review = await prisma.review.delete({ where: { id: params.id } });
    await recomputeRating(review.productId);
    revalidateTag("catalog");
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/admin/reviews/[id]", e);
    return NextResponse.json({ error: "Could not delete review" }, { status: 500 });
  }
}
