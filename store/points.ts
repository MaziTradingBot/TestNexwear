import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useEffect } from "react";

/** 100 points = $1 redeemed. */
export const POINTS_PER_DOLLAR = 100;
/** Minimum balance before redemption is offered. */
export const MIN_REDEEM_POINTS = 100;

interface PointsState {
  redeem: number; // points the customer chose to redeem
  balance: number; // available balance (fetched, not persisted)
  setRedeem: (points: number) => void;
  setBalance: (points: number) => void;
  clear: () => void;
  /** Dollar value of redeemed points, capped to `maxValue` (e.g. subtotal − coupon). */
  discountFor: (maxValue: number) => number;
}

export const usePointsStore = create<PointsState>()(
  persist(
    (set, get) => ({
      redeem: 0,
      balance: 0,
      setRedeem: (points) => set({ redeem: Math.max(0, Math.floor(points)) }),
      setBalance: (balance) => set({ balance: Math.max(0, Math.floor(balance)) }),
      clear: () => set({ redeem: 0 }),
      discountFor: (maxValue) => {
        const usable = Math.min(get().redeem, get().balance);
        const value = Math.round((usable / POINTS_PER_DOLLAR) * 100) / 100;
        return Math.min(value, Math.max(0, maxValue));
      },
    }),
    { name: "nexwear-points", partialize: (s) => ({ redeem: s.redeem }) },
  ),
);

/** Fetches the signed-in customer's live points balance into the store. */
export function useSyncPointsBalance() {
  const setBalance = usePointsStore((s) => s.setBalance);
  useEffect(() => {
    let active = true;
    fetch("/api/account/points")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (active && d) setBalance(d.points ?? 0);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [setBalance]);
}
