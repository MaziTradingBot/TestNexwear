import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistLine {
  productId: string;
  slug: string;
  title: string;
  brand: string;
  image: string;
  price: number;
  discountPrice: number | null;
}

interface WishlistState {
  items: WishlistLine[];
  toggle: (item: WishlistLine) => void;
  remove: (productId: string) => void;
  has: (productId: string) => boolean;
  clear: () => void;
  count: () => number;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (item) =>
        set((state) =>
          state.items.some((i) => i.productId === item.productId)
            ? { items: state.items.filter((i) => i.productId !== item.productId) }
            : { items: [...state.items, item] },
        ),
      remove: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      has: (productId) => get().items.some((i) => i.productId === productId),
      clear: () => set({ items: [] }),
      count: () => get().items.length,
    }),
    { name: "nexwear-wishlist" },
  ),
);
