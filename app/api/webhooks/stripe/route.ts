import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { settleOrderPaid } from "@/lib/orders";

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
      await settleOrderPaid(orderId, {
        paymentRef: String(session.payment_intent ?? session.id),
        pointsRedeemed: Number(session.metadata?.pointsRedeemed ?? 0) || 0,
      });
    }
  }

  return NextResponse.json({ received: true });
}
