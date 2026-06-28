import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { sendMail, orderCancelledEmail } from "@/lib/mailer";
import { PaymentStatus, OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

// Customers may cancel only before the order has shipped.
const CANCELLABLE: OrderStatus[] = [OrderStatus.PENDING, OrderStatus.PAID, OrderStatus.PROCESSING];
const REFUNDABLE: PaymentStatus[] = [PaymentStatus.PAID, PaymentStatus.SIMULATED];

export async function POST(_req: Request, { params }: { params: { orderNumber: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Please sign in" }, { status: 401 });

  const order = await prisma.order.findFirst({
    where: { orderNumber: params.orderNumber, userId: session.user.id },
    include: { items: true, payment: true },
  });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  if (!CANCELLABLE.includes(order.status)) {
    return NextResponse.json(
      { error: "This order can no longer be cancelled — it has already shipped or completed." },
      { status: 409 },
    );
  }

  const willRefund = REFUNDABLE.includes(order.paymentStatus);

  // Attempt a real Stripe refund when this was a live card payment.
  if (willRefund && order.paymentStatus === "PAID" && stripe && order.payment?.providerRefId?.startsWith("pi_")) {
    try {
      await stripe.refunds.create({ payment_intent: order.payment.providerRefId });
    } catch (e) {
      console.error("[cancel] Stripe refund failed", e);
    }
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CANCELLED,
          ...(willRefund ? { paymentStatus: PaymentStatus.REFUNDED } : {}),
          ...(order.payment && willRefund ? { payment: { update: { status: PaymentStatus.REFUNDED } } } : {}),
        },
      });

      // Return reserved stock to inventory.
      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant
            .update({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } })
            .catch(() => null);
        }
      }
    });

    sendMail({
      to: order.customerEmail,
      ...orderCancelledEmail({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        total: Number(order.total),
        refunded: willRefund,
      }),
    }).catch((e) => console.error("[cancel] email failed", e));

    return NextResponse.json({ ok: true, refunded: willRefund });
  } catch (e) {
    console.error("POST /api/account/orders/[orderNumber]/cancel", e);
    return NextResponse.json({ error: "Could not cancel the order. Please contact support." }, { status: 500 });
  }
}
