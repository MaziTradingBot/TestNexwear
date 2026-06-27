"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Package, Truck, CalendarClock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCheckoutStore } from "@/store/checkout";
import { useCartStore } from "@/store/cart";
import { useCouponStore } from "@/store/coupon";
import { formatDate } from "@/lib/format";
import { useMoney } from "@/components/providers/CurrencyProvider";

const PAYMENT_LABELS: Record<string, string> = {
  CARD: "Card Payment",
  APPLE_PAY: "Apple Pay",
  GOOGLE_PAY: "Google Pay",
  BANK_TRANSFER: "Bank Transfer",
  CASH_ON_DELIVERY: "Cash on Delivery",
};

export default function SuccessPage() {
  const [mounted, setMounted] = useState(false);
  const order = useCheckoutStore((s) => s.lastOrder);
  const { format: formatPrice } = useMoney();
  useEffect(() => {
    setMounted(true);
    // Once an order is confirmed, empty the bag (covers the Stripe return path
    // where the cart wasn't cleared before redirect).
    if (useCheckoutStore.getState().lastOrder) {
      useCartStore.getState().clear();
      useCouponStore.getState().clear();
      useCheckoutStore.getState().reset();
    }
  }, []);

  if (!mounted) return <div className="container-luxe py-24" />;

  if (!order) {
    return (
      <div className="container-luxe flex flex-col items-center py-28 text-center">
        <h1 className="font-serif text-3xl font-light uppercase tracking-wide2">No Recent Order</h1>
        <p className="mt-2 text-sm text-stone">Looks like there&apos;s nothing to show here yet.</p>
        <Link href="/" className="mt-8">
          <Button>Back To Home</Button>
        </Link>
      </div>
    );
  }

  const rows = [
    { icon: <Package className="h-5 w-5" />, label: "Order Number", value: order.orderNumber },
    { icon: <Truck className="h-5 w-5" />, label: "Tracking Number", value: order.trackingNumber },
    {
      icon: <CalendarClock className="h-5 w-5" />,
      label: "Delivery Method",
      value: `${order.deliveryMethod === "EXPRESS" ? "Express" : "Standard"} · ${order.deliveryProvider.replace(/_/g, " ")}`,
    },
    {
      icon: <CalendarClock className="h-5 w-5" />,
      label: "Estimated Delivery",
      value: formatDate(order.estimatedDelivery),
    },
  ];

  return (
    <div className="container-luxe flex flex-col items-center py-16 text-center">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 16 }}
        className="flex h-20 w-20 items-center justify-center rounded-full bg-ink text-white"
      >
        <Check className="h-9 w-9 text-gold" />
      </motion.div>

      <p className="eyebrow mt-7">Thank You</p>
      <h1 className="mt-2 font-serif text-4xl font-light uppercase tracking-wide2 md:text-5xl">
        Order Confirmed
      </h1>
      <p className="mt-3 flex items-center gap-2 text-sm text-stone">
        <Mail className="h-4 w-4" /> A confirmation has been sent to {order.email}
      </p>

      <div className="mt-10 w-full max-w-lg divide-y divide-line border border-line text-left">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-4 px-6 py-4">
            <span className="text-gold">{r.icon}</span>
            <span className="flex-1 text-xs uppercase tracking-wide2 text-stone">{r.label}</span>
            <span className="text-sm font-medium text-ink">{r.value}</span>
          </div>
        ))}
        <div className="flex items-center gap-4 bg-bone px-6 py-4">
          <span className="flex-1 text-xs uppercase tracking-wide2 text-stone">Total Paid</span>
          <span className="font-serif text-xl text-ink">{formatPrice(order.total)}</span>
        </div>
      </div>

      <p className="mt-6 max-w-md text-xs text-stone">
        Paid via {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}. You can track your delivery
        from your account dashboard.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/account">
          <Button variant="outline">View My Orders</Button>
        </Link>
        <Link href="/">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    </div>
  );
}
