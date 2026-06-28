import { prisma } from "@/lib/prisma";
import { PaymentStatus, OrderStatus } from "@prisma/client";

// A review counts as a genuine purchase only when the order was actually paid
// (or is a legitimate cash-on-delivery order) and wasn't cancelled/returned.
const PURCHASED_PAYMENT: PaymentStatus[] = [
  PaymentStatus.PAID,
  PaymentStatus.SIMULATED,
  PaymentStatus.COD_PENDING,
];
const EXCLUDED_STATUS: OrderStatus[] = [OrderStatus.CANCELLED, OrderStatus.RETURNED];

/** True if the user has a qualifying order containing this product. */
export async function userHasPurchased(userId: string, productId: string): Promise<boolean> {
  const item = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: {
        userId,
        paymentStatus: { in: PURCHASED_PAYMENT },
        status: { notIn: EXCLUDED_STATUS },
      },
    },
    select: { id: true },
  });
  return Boolean(item);
}

/** True if the user has already left a review for this product. */
export async function userHasReviewed(userId: string, productId: string): Promise<boolean> {
  const review = await prisma.review.findFirst({
    where: { userId, productId },
    select: { id: true },
  });
  return Boolean(review);
}
