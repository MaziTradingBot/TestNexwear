import { prisma } from "@/lib/prisma";
import { sendMail, orderConfirmationEmail } from "@/lib/mailer";

/**
 * Marks an order PAID exactly once, awards net loyalty points (earned − redeemed)
 * and sends the confirmation email. Safe to call from both the Stripe webhook and
 * the post-payment return on the success page — the PAID transition is claimed
 * atomically so points and email never fire twice.
 */
export async function settleOrderPaid(
  orderId: string,
  opts: { paymentRef?: string; pointsRedeemed?: number } = {},
): Promise<"settled" | "already" | "missing"> {
  // Atomically claim the PENDING → PAID transition. count === 1 means we won.
  const claim = await prisma.order.updateMany({
    where: { id: orderId, paymentStatus: { not: "PAID" } },
    data: { status: "PAID", paymentStatus: "PAID" },
  });
  if (claim.count === 0) {
    const exists = await prisma.order.findUnique({ where: { id: orderId }, select: { id: true } });
    return exists ? "already" : "missing";
  }

  await prisma.payment
    .updateMany({
      where: { orderId },
      data: { status: "PAID", ...(opts.paymentRef ? { providerRefId: opts.paymentRef } : {}) },
    })
    .catch(() => null);

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) return "settled";

  if (order.userId) {
    // Earn 1 point per $1, minus any points redeemed on this order.
    const redeemed = Math.max(0, Math.floor(opts.pointsRedeemed ?? 0));
    const delta = Math.floor(Number(order.total)) - redeemed;
    if (delta !== 0) {
      await prisma.user
        .update({ where: { id: order.userId }, data: { loyaltyPoints: { increment: delta } } })
        .catch(() => null);
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
  }).catch((e) => console.error("[settleOrderPaid] email failed", e));

  return "settled";
}
