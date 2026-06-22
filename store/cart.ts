import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartLine {
  productId: string;
  variantId?: string;
  slug: string;
  title: string;
  brand?: string;
  image: string;
  price: number; // effective unit price (already discounted)
  size?: string;
  color?: string;
  quantity: number;
  savedForLater?: boolean;
}

function sameLine(a: CartLine, b: { productId: string; variantId?: string; size?: string; color?: string }) {
  return (
    a.productId === b.productId &&
    a.variantId === b.variantId &&
    a.size === b.size &&
    a.color === b.color
  );
}

interface CartState {
  items: CartLine[];
  addItem: (item: CartLine) => void;
  removeItem: (line: CartLine) => void;
  updateQuantity: (line: CartLine, quantity: number) => void;
  toggleSaveForLater: (line: CartLine) => void;
  clear: () => void;
  totalItems: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => sameLine(i, item));
          if (existing) {
            return {
              items: state.items.map((i) =>
                i === existing ? { ...i, quantity: i.quantity + item.quantity, savedForLater: false } : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, savedForLater: false }] };
        }),

      removeItem: (line) =>
        set((state) => ({ items: state.items.filter((i) => !sameLine(i, line)) })),

      updateQuantity: (line, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) => (sameLine(i, line) ? { ...i, quantity } : i))
            .filter((i) => i.quantity > 0),
        })),

      toggleSaveForLater: (line) =>
        set((state) => ({
          items: state.items.map((i) =>
            sameLine(i, line) ? { ...i, savedForLater: !i.savedForLater } : i,
          ),
        })),

      clear: () => set({ items: [] }),

      totalItems: () =>
        get().items.filter((i) => !i.savedForLater).reduce((s, i) => s + i.quantity, 0),
      subtotal: () =>
        get().items.filter((i) => !i.savedForLater).reduce((s, i) => s + i.price * i.quantity, 0),
    }),
    { name: "nexwear-cart" },
  ),
);
