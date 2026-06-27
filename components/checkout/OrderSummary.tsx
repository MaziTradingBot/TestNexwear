"use client";

import Image from "next/image";
import { useCartStore } from "@/store/cart";
import { useCouponStore } from "@/store/coupon";
import { useMoney } from "@/components/providers/CurrencyProvider";

export function OrderSummary({ shippingCost = 0 }: { shippingCost?: number }) {
  const items = useCartStore((s) => s.items).filter((i) => !i.savedForLater);
  const subtotal = useCartStore((s) => s.subtotal());
  const discount = useCouponStore((s) => s.discountFor(subtotal));
  const coupon = useCouponStore((s) => s.coupon);
  const { format: formatPrice } = useMoney();
  const total = Math.max(0, subtotal - discount) + shippingCost;

  return (
    <div className="border border-line p-6">
      <h2 className="mb-5 text-sm font-medium uppercase tracking-wide2">Order Summary</h2>
      <ul className="mb-5 max-h-72 space-y-4 overflow-y-auto">
        {items.map((item) => (
          <li key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-3">
            <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-bone">
              {item.image && <Image src={item.image} alt={item.title} fill sizes="64px" className="object-cover" />}
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center bg-ink text-[0.6rem] text-white">
                {item.quantity}
              </span>
            </div>
            <div className="flex flex-1 flex-col text-xs">
              <span className="text-[0.6rem] uppercase tracking-wide2 text-stone">{item.brand}</span>
              <span className="truncate text-ink">{item.title}</span>
              <span className="text-stone">
                {item.color}{item.size ? ` · ${item.size}` : ""}
              </span>
              <span className="mt-auto text-ink">{formatPrice(item.price * item.quantity)}</span>
            </div>
          </li>
        ))}
      </ul>

      <dl className="space-y-2.5 border-t border-line pt-5 text-sm">
        <div className="flex justify-between">
          <dt className="text-stone">Subtotal</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-gold">
            <dt>Discount {coupon && `(${coupon.code})`}</dt>
            <dd>−{formatPrice(discount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-stone">Shipping</dt>
          <dd>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</dd>
        </div>
        <div className="flex justify-between border-t border-line pt-4 text-base font-medium">
          <dt>Total</dt>
          <dd>{formatPrice(total)}</dd>
        </div>
      </dl>
    </div>
  );
}
