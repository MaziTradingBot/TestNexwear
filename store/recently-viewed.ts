import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ViewedLine {
  productId: string;
  slug: string;
  title: string;
  brand: string;
  image: string;
  price: number;
  discountPrice: number | null;
}

interface RecentlyViewedState {
  items: ViewedLine[];
  add: (item: ViewedLine) => void;
  clear: () => void;
}

const MAX = 12;

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) =>
        set((state) => {
          const rest = state.items.filter((i) => i.productId !== item.productId);
          return { items: [item, ...rest].slice(0, MAX) };
        }),
      clear: () => set({ items: [] }),
    }),
    { name: "nexwear-recently-viewed" },
  ),
);
