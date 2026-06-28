import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { userHasPurchased, userHasReviewed } from "@/lib/reviews";

export const dynamic = "force-dynamic";

const schema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  comment: z.string().min(3).max(2000),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in to leave a review" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid review" }, { status: 400 });

  try {
    // Only customers who actually bought the product may review it.
    const purchased = await userHasPurchased(session.user.id, parsed.data.productId);
    if (!purchased) {
      return NextResponse.json(
        { error: "Only customers who have purchased this product can review it." },
        { status: 403 },
      );
    }

    // One review per customer per product.
    if (await userHasReviewed(session.user.id, parsed.data.productId)) {
      return NextResponse.json(
        { error: "You've already reviewed this product." },
        { status: 409 },
      );
    }

    await prisma.review.create({
      data: {
        productId: parsed.data.productId,
        userId: session.user.id,
        rating: parsed.data.rating,
        title: parsed.data.title,
        comment: parsed.data.comment,
        isVerified: true, // gated to buyers, so always a verified purchase
        isApproved: false, // pending admin moderation
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST /api/reviews", e);
    return NextResponse.json({ error: "Could not submit review" }, { status: 500 });
  }
}
