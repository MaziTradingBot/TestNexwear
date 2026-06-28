"use client";

import { Award, X } from "lucide-react";
import {
  usePointsStore,
  useSyncPointsBalance,
  POINTS_PER_DOLLAR,
  MIN_REDEEM_POINTS,
} from "@/store/points";
import { useCartStore } from "@/store/cart";
import { useCouponStore } from "@/store/coupon";
import { useMoney } from "@/components/providers/CurrencyProvider";

/**
 * Lets a signed-in customer turn loyalty points into a discount.
 * Renders nothing for logged-out users or balances below the minimum.
 */
export function PointsRedeem() {
  useSyncPointsBalance();
  const balance = usePointsStore((s) => s.balance);
  const redeem = usePointsStore((s) => s.redeem);
  const setRedeem = usePointsStore((s) => s.setRedeem);
  const clearRedeem = usePointsStore((s) => s.clear);

  const subtotal = useCartStore((s) => s.subtotal());
  const couponDiscount = useCouponStore((s) => s.discountFor(subtotal));
  const { format: formatPrice } = useMoney();

  if (balance < MIN_REDEEM_POINTS) return null;

  const redeemableValue = Math.max(0, subtotal - couponDiscount);
  const maxPoints = Math.min(balance, Math.floor(redeemableValue * POINTS_PER_DOLLAR));
  if (maxPoints < MIN_REDEEM_POINTS) return null;

  const applied = redeem > 0;
  const appliedPoints = Math.min(redeem, maxPoints);

  return (
    <div className="mb-5">
      {applied ? (
        <div className="flex items-center justify-between border border-gold bg-gold/5 px-3 py-2.5 text-sm">
          <span className="flex items-center gap-2 text-gold">
            <Award className="h-4 w-4" />
            {appliedPoints} pts · −{formatPrice(appliedPoints / POINTS_PER_DOLLAR)}
          </span>
          <button type="button" onClick={() => clearRedeem()} className="text-stone hover:text-ink" aria-label="Remove points">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setRedeem(maxPoints)}
          className="flex w-full items-center justify-between border border-line px-3 py-2.5 text-sm transition-colors hover:border-gold hover:bg-gold/5"
        >
          <span className="flex items-center gap-2 text-ink">
            <Award className="h-4 w-4 text-gold" />
            Redeem {balance.toLocaleString()} points
          </span>
          <span className="text-gold">Save {formatPrice(maxPoints / POINTS_PER_DOLLAR)}</span>
        </button>
      )}
    </div>
  );
}
