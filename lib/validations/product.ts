import { z } from "zod";

export const productInput = z.object({
  title: z.string().min(2).max(160),
  description: z.string().min(5),
  brandId: z.string().min(1),
  categoryId: z.string().min(1),
  sku: z.string().max(60).optional().nullable(),
  price: z.number().positive(),
  discountPrice: z.number().positive().nullable().optional(),
  material: z.string().max(80).optional().nullable(),
  collection: z.string().max(80).optional().nullable(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isNewArrival: z.boolean().optional(),
  images: z.array(z.string().url()).min(1, "Add at least one image URL"),
  variants: z
    .array(
      z.object({
        size: z.string().min(1).max(20),
        color: z.string().min(1).max(40),
        colorHex: z.string().max(9).optional().nullable(),
        stock: z.number().int().min(0),
      }),
    )
    .min(1, "Add at least one variant"),
});

export type ProductInput = z.infer<typeof productInput>;
