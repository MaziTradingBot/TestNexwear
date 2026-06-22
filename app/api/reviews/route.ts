import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    // Verified buyer if they have an order for this product
    const purchased = await prisma.orderItem.findFirst({
      where: { productId: parsed.data.productId, order: { userId: session.user.id } },
      select: { id: true },
    });

    await prisma.review.create({
      data: {
        productId: parsed.data.productId,
        userId: session.user.id,
        rating: parsed.data.rating,
        title: parsed.data.title,
        comment: parsed.data.comment,
        isVerified: Boolean(purchased),
        isApproved: false, // pending admin moderation
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST /api/reviews", e);
    return NextResponse.json({ error: "Could not submit review" }, { status: 500 });
  }
}
