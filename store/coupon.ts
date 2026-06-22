import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AppliedCoupon {
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  minSpend: number;
}

interface CouponState {
  coupon: AppliedCoupon | null;
  apply: (coupon: AppliedCoupon) => void;
  clear: () => void;
  /** Discount amount for a given subtotal (respects minSpend). */
  discountFor: (subtotal: number) => number;
}

export const useCouponStore = create<CouponState>()(
  persist(
    (set, get) => ({
      coupon: null,
      apply: (coupon) => set({ coupon }),
      clear: () => set({ coupon: null }),
      discountFor: (subtotal) => {
        const c = get().coupon;
        if (!c || subtotal < c.minSpend) return 0;
        const d = c.type === "PERCENT" ? (subtotal * c.value) / 100 : c.value;
        return Math.min(Math.round(d * 100) / 100, subtotal);
      },
    }),
    { name: "nexwear-coupon" },
  ),
);
