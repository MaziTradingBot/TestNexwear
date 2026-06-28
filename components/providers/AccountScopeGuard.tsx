"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { useCouponStore } from "@/store/coupon";
import { usePointsStore } from "@/store/points";

/**
 * Keeps locally-persisted shopping state (cart, wishlist, coupon, points)
 * tied to the signed-in account so it is never shared between users on the
 * same device.
 *
 * - Guest → sign in: the guest bag is "claimed" by the new account (kept).
 * - User A → User B: A's bag/wishlist are wiped before B takes over.
 * - Sign out: everything is cleared so the next person starts fresh.
 */
export function AccountScopeGuard() {
  const { data, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    const uid = data?.user?.id ?? null;
    const owner = useCartStore.getState().ownerId;

    const wipe = () => {
      useCartStore.getState().clear();
      useWishlistStore.getState().clear();
      useCouponStore.getState().clear();
      usePointsStore.getState().clear();
    };

    if (uid) {
      // A different account previously owned this bag → clear before claiming.
      if (owner && owner !== uid) wipe();
      useCartStore.getState().setOwner(uid);
    } else if (owner) {
      // Signed out — don't leave a bag for the next person on this device.
      wipe();
      useCartStore.getState().setOwner(null);
    }
  }, [data, status]);

  return null;
}
