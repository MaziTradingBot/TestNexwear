import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ShippingInput } from "@/lib/validations/checkout";

export type DeliveryMethod = "STANDARD" | "EXPRESS";

export interface RateInfo {
  price: number;
  etaDaysMin: number;
  etaDaysMax: number;
}

export interface PlacedOrder {
  orderNumber: string;
  trackingNumber: string;
  deliveryMethod: string;
  deliveryProvider: string;
  estimatedDelivery: string;
  total: number;
  email: string;
  paymentMethod: string;
}

interface CheckoutState {
  shipping: ShippingInput | null;
  deliveryMethod: DeliveryMethod;
  deliveryProvider: string;
  rates: Partial<Record<DeliveryMethod, RateInfo>>;
  lastOrder: PlacedOrder | null;
  setShipping: (s: ShippingInput) => void;
  setDeliveryMethod: (m: DeliveryMethod) => void;
  setDeliveryProvider: (p: string) => void;
  setRates: (r: Partial<Record<DeliveryMethod, RateInfo>>) => void;
  setLastOrder: (o: PlacedOrder) => void;
  reset: () => void;
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      shipping: null,
      deliveryMethod: "STANDARD",
      deliveryProvider: "STANDARD",
      rates: {},
      lastOrder: null,
      setShipping: (shipping) => set({ shipping }),
      setDeliveryMethod: (deliveryMethod) => set({ deliveryMethod }),
      setDeliveryProvider: (deliveryProvider) => set({ deliveryProvider }),
      setRates: (rates) => set({ rates }),
      setLastOrder: (lastOrder) => set({ lastOrder }),
      reset: () => set({ shipping: null, deliveryMethod: "STANDARD", deliveryProvider: "STANDARD", rates: {} }),
    }),
    { name: "nexwear-checkout" },
  ),
);
