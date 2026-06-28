import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendMail, orderConfirmationEmail } from "@/lib/mailer";

export const dynamic = "force-dynamic";

/**
 * Stripe webhook — confirms payment, marks the order PAID, awards loyalty
 * points and sends the order-confirmation email. Set STRIPE_WEBHOOK_SECRET.
 */
export async function POST(req: Request) {
  if (!stripe) return NextResponse.json({ error: "Stripe not configured" }, { status: 400 });
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET" }, { status: 400 });

  const sig = req.headers.get("stripe-signature");
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig ?? "", secret);
  } catch (e) {
    return NextResponse.json({ error: `Signature verification failed: ${(e as Error).message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (orderId && session.payment_status === "paid") {
      const existing = await prisma.order.findUnique({ where: { id: orderId } });

      // Idempotent: only act the first time we see a paid order.
      if (existing && existing.paymentStatus !== "PAID") {
        const order = await prisma.order.update({
          where: { id: orderId },
          data: {
            status: "PAID",
            paymentStatus: "PAID",
            payment: { update: { status: "PAID", providerRefId: String(session.payment_intent ?? session.id) } },
          },
          include: { items: true },
        });

        if (order.userId) {
          // Earn 1 point per $1, minus any points redeemed on this order.
          const redeemed = Number(session.metadata?.pointsRedeemed ?? 0) || 0;
          const delta = Math.floor(Number(order.total)) - redeemed;
          if (delta !== 0) {
            await prisma.user.update({
              where: { id: order.userId },
              data: { loyaltyPoints: { increment: delta } },
            }).catch(() => null);
          }
        }

        sendMail({
          to: order.customerEmail,
          ...orderConfirmationEmail({
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            total: Number(order.total),
            trackingNumber: order.trackingNumber,
            estimatedDelivery: order.estimatedDelivery,
            items: order.items.map((i) => ({
              title: i.title, quantity: i.quantity, unitPrice: Number(i.unitPrice), size: i.size, color: i.color,
            })),
          }),
        }).catch((e) => console.error("[stripe webhook] email failed", e));
      }
    }
  }

  return NextResponse.json({ received: true });
}
