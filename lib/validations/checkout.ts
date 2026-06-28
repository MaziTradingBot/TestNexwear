import { z } from "zod";

export const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional().nullable(),
  title: z.string().min(1),
  image: z.string().optional().nullable(),
  size: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  price: z.number().nonnegative(),
  quantity: z.number().int().positive().max(20),
});

export const shippingSchema = z.object({
  fullName: z.string().min(2, "Enter your full name").max(120),
  email: z.string().email("Enter a valid email"),
  phone: z.string().regex(/^\+?[\d\s().-]{7,20}$/, "Enter a valid phone number"),
  country: z.string().min(2),
  city: z.string().min(2, "Enter your city"),
  address: z.string().min(4, "Enter your street address"),
  postalCode: z.string().min(2, "Enter your postal code").max(12),
});

export const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, "Your cart is empty"),
  shipping: shippingSchema,
  deliveryMethod: z.enum(["STANDARD", "EXPRESS"]),
  deliveryProvider: z.enum([
    "STANDARD", "EXPRESS", "AMAZON_LOGISTICS", "ALIEXPRESS", "MEEST", "DHL", "FEDEX", "UPS",
  ]),
  paymentMethod: z.enum([
    "CARD", "APPLE_PAY", "GOOGLE_PAY", "BANK_TRANSFER", "CASH_ON_DELIVERY",
  ]),
  couponCode: z.string().max(40).optional().nullable(),
  pointsRedeemed: z.number().int().nonnegative().max(10_000_000).optional(),
  notes: z.string().max(500).optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ShippingInput = z.infer<typeof shippingSchema>;
