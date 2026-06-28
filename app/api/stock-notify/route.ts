import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const schema = z.object({
  productId: z.string().min(1),
  email: z.string().email("Enter a valid email"),
});

/** Adds an email to a product's back-in-stock waitlist (idempotent). */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }
  const { productId, email } = parsed.data;

  const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  await prisma.stockNotification.upsert({
    where: { productId_email: { productId, email: email.toLowerCase() } },
    create: { productId, email: email.toLowerCase() },
    update: { notified: false }, // re-arm if they sold out again
  });

  return NextResponse.json({ ok: true });
}
