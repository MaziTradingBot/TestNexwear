import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/validations/checkout";
import { sendMail, orderConfirmationEmail } from "@/lib/mailer";
import { stripe, stripeEnabled } from "@/lib/stripe";
import { SITE } from "@/lib/constants";
import { PaymentStatus, ShippingMethod, DeliveryProvider, PaymentMethod } from "@prisma/client";

export const dynamic = "force-dynamic";

function genOrderNumber() {
  return `NX-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 9000 + 1000)}`;
}

function genTracking(provider: string) {
  const prefix = provider.slice(0, 3).toUpperCase();
  return `${prefix}${Math.floor(Math.random() * 9e9 + 1e9)}`;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  const body = await req.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid checkout details", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { items, shipping, deliveryMethod, deliveryProvider, paymentMethod, couponCode, pointsRedeemed, notes } = parsed.data;

  // 1. Re-price from DB (never trust client prices)
  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) }, isActive: true },
    include: { variants: true },
  });

  let subtotal = 0;
  const orderItems: {
    productId: string;
    variantId?: string;
    title: string;
    image: string;
    size?: string;
    color?: string;
    unitPrice: number;
    quantity: number;
  }[] = [];
  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      return NextResponse.json({ error: `A product in your bag is no longer available` }, { status: 404 });
    }
    const variant = item.variantId ? product.variants.find((v) => v.id === item.variantId) : undefined;
    const unitPrice = Number(product.discountPrice ?? product.price);
    subtotal += unitPrice * item.quantity;
    orderItems.push({
      productId: product.id,
      variantId: variant?.id,
      title: product.title,
      image: item.image ?? product.id,
      size: item.size ?? undefined,
      color: item.color ?? undefined,
      unitPrice,
      quantity: item.quantity,
    });
  }

  // 2. Coupon
  let discount = 0;
  let appliedCode: string | null = null;
  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
    if (coupon && coupon.isActive && subtotal >= Number(coupon.minSpend)) {
      discount =
        coupon.type === "PERCENT"
          ? (subtotal * Number(coupon.value)) / 100
          : Number(coupon.value);
      discount = Math.min(Math.round(discount * 100) / 100, subtotal);
      appliedCode = coupon.code;
      await prisma.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } }).catch(() => null);
    }
  }

  // 2b. Loyalty points redemption (100 pts = $1), signed-in customers only.
  // Re-validated against the live balance — never trust the client amount.
  let pointsToRedeem = 0;
  if (session?.user?.id && pointsRedeemed && pointsRedeemed > 0) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { loyaltyPoints: true },
    });
    const balance = user?.loyaltyPoints ?? 0;
    const redeemableValue = Math.max(0, subtotal - discount);
    const maxPoints = Math.min(balance, Math.floor(redeemableValue * 100));
    pointsToRedeem = Math.max(0, Math.min(Math.floor(pointsRedeemed), maxPoints));
    if (pointsToRedeem > 0) {
      discount = Math.min(subtotal, discount + pointsToRedeem / 100);
    }
  }

  // 3. Shipping
  const rate = await prisma.shippingRate.findUnique({
    where: { country_method: { country: shipping.country, method: deliveryMethod as ShippingMethod } },
  });
  const shippingCost = rate ? Number(rate.price) : deliveryMethod === "EXPRESS" ? 24.95 : 9.95;
  const etaMax = rate?.etaDaysMax ?? (deliveryMethod === "EXPRESS" ? 3 : 10);

  const total = Math.max(0, subtotal - discount) + shippingCost;
  const orderNumber = genOrderNumber();
  const trackingNumber = genTracking(deliveryProvider);
  const estimatedDelivery = new Date(Date.now() + etaMax * 86_400_000);

  // Use real Stripe Checkout for card payments when configured; otherwise simulate.
  const useStripe = paymentMethod === "CARD" && stripeEnabled;
  const paymentStatus = useStripe
    ? PaymentStatus.PENDING
    : paymentMethod === "CASH_ON_DELIVERY"
      ? PaymentStatus.COD_PENDING
      : PaymentStatus.SIMULATED;

  // 4. Persist order + items + payment, decrement stock
  try {
    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber,
          userId: session?.user?.id ?? null,
          status: paymentStatus === PaymentStatus.SIMULATED ? "PAID" : "PENDING",
          // Stripe orders start PENDING and flip to PAID via webhook.
          paymentMethod: paymentMethod as PaymentMethod,
          paymentStatus,
          deliveryMethod: deliveryMethod as ShippingMethod,
          deliveryProvider: deliveryProvider as DeliveryProvider,
          trackingNumber,
          customerName: shipping.fullName,
          customerEmail: shipping.email,
          customerPhone: shipping.phone,
          shipCountry: shipping.country,
          shipCity: shipping.city,
          shipAddress: shipping.address,
          shipPostalCode: shipping.postalCode,
          couponCode: appliedCode,
          subtotal,
          discount,
          shippingCost,
          total,
          estimatedDelivery,
          notes,
          items: { create: orderItems },
          payment: {
            create: {
              provider: paymentMethod as PaymentMethod,
              providerRefId: useStripe ? null : `SIM-${Date.now().toString(36).toUpperCase()}`,
              amount: total,
              status: paymentStatus,
            },
          },
        },
      });

      for (const item of orderItems) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          }).catch(() => null);
        }
      }

      // Loyalty points. Non-Stripe orders settle now: earn 1/$1 and subtract
      // any redeemed points in a single net adjustment. Stripe orders settle
      // in the webhook once paid, so points aren't touched on abandonment.
      if (session?.user?.id && !useStripe) {
        const delta = Math.floor(total) - pointsToRedeem;
        if (delta !== 0) {
          await tx.user.update({
            where: { id: session.user.id },
            data: { loyaltyPoints: { increment: delta } },
          }).catch(() => null);
        }
      }

      return created;
    });

    const orderResponse = {
      orderNumber: order.orderNumber,
      trackingNumber: order.trackingNumber,
      deliveryMethod: order.deliveryMethod,
      deliveryProvider: order.deliveryProvider,
      estimatedDelivery: order.estimatedDelivery?.toISOString(),
      total: Number(order.total),
      email: order.customerEmail,
      paymentMethod: order.paymentMethod,
    };

    // Save the shipping address to the user's address book (deduped).
    if (session?.user?.id) {
      const existing = await prisma.address.findFirst({
        where: { userId: session.user.id, address: shipping.address, postalCode: shipping.postalCode, city: shipping.city },
      });
      if (!existing) {
        const count = await prisma.address.count({ where: { userId: session.user.id } });
        await prisma.address.create({
          data: {
            userId: session.user.id,
            fullName: shipping.fullName,
            phone: shipping.phone,
            country: shipping.country,
            city: shipping.city,
            address: shipping.address,
            postalCode: shipping.postalCode,
            isDefault: count === 0,
          },
        }).catch(() => null);
      }
    }

    // Real card payment → create a Stripe Checkout Session and redirect.
    if (useStripe && stripe) {
      const lineItems: import("stripe").Stripe.Checkout.SessionCreateParams.LineItem[] = orderItems.map((i) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: `${i.title}${i.size ? ` · ${i.size}` : ""}${i.color ? ` · ${i.color}` : ""}`,
          },
          unit_amount: Math.round(i.unitPrice * 100),
        },
        quantity: i.quantity,
      }));
      if (shippingCost > 0) {
        lineItems.push({
          price_data: { currency: "usd", product_data: { name: `Shipping (${deliveryMethod})` }, unit_amount: Math.round(shippingCost * 100) },
          quantity: 1,
        });
      }

      let discounts: import("stripe").Stripe.Checkout.SessionCreateParams.Discount[] | undefined;
      if (discount > 0) {
        const coupon = await stripe.coupons.create({
          amount_off: Math.round(discount * 100),
          currency: "usd",
          duration: "once",
          name: appliedCode ?? "Discount",
        });
        discounts = [{ coupon: coupon.id }];
      }

      const checkout = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: shipping.email,
        line_items: lineItems,
        discounts,
        metadata: { orderNumber: order.orderNumber, orderId: order.id, pointsRedeemed: String(pointsToRedeem) },
        success_url: `${SITE.url}/checkout/success?order=${order.orderNumber}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${SITE.url}/checkout/payment`,
      });

      return NextResponse.json({ order: orderResponse, redirectUrl: checkout.url });
    }

    // Send order confirmation (non-blocking — never fail the order on email issues)
    sendMail({
      to: shipping.email,
      ...orderConfirmationEmail({
        orderNumber: order.orderNumber,
        customerName: shipping.fullName,
        total: Number(order.total),
        trackingNumber: order.trackingNumber,
        estimatedDelivery: order.estimatedDelivery,
        items: orderItems.map((i) => ({
          title: i.title, quantity: i.quantity, unitPrice: i.unitPrice, size: i.size, color: i.color,
        })),
      }),
    }).catch((e) => console.error("[checkout] confirmation email failed", e));

    return NextResponse.json({ order: orderResponse });
  } catch (e) {
    console.error("POST /api/checkout", e);
    return NextResponse.json({ error: "Could not place your order. Please try again." }, { status: 500 });
  }
}
