import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { settleOrderPaid } from "@/lib/orders";

export const dynamic = "force-dynamic";

/**
 * Confirms a Stripe Checkout payment when the customer lands on the success
 * page. This is a safety net alongside the webhook: it guarantees the order
 * flips to PAID immediately on return, even if the webhook is delayed or not
 * configured. Stripe is the source of truth — we only settle sessions it
 * reports as actually paid.
 */
export async function POST(req: Request) {
  if (!stripe) return NextResponse.json({ ok: false, reason: "stripe-disabled" });

  const { sessionId } = await req.json().catch(() => ({}));
  if (!sessionId || typeof sessionId !== "string") {
    return NextResponse.json({ error: "Missing session id" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const orderId = session.metadata?.orderId;

    if (session.payment_status === "paid" && orderId) {
      const result = await settleOrderPaid(orderId, {
        paymentRef: String(session.payment_intent ?? session.id),
        pointsRedeemed: Number(session.metadata?.pointsRedeemed ?? 0) || 0,
      });
      return NextResponse.json({ ok: true, paid: true, result });
    }

    return NextResponse.json({ ok: true, paid: session.payment_status === "paid" });
  } catch (e) {
    console.error("POST /api/checkout/confirm", e);
    return NextResponse.json({ error: "Could not confirm payment" }, { status: 500 });
  }
}
