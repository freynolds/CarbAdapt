import { z } from "zod";

export const productTypeSchema = z.enum(["DRINK_MIX", "GEL", "SOLID"]);

export const productSchema = z.object({
  id: z.string(),
  type: productTypeSchema,
  name: z.string(),
  brand: z.string(),
  carbsG: z.number(),
  favorite: z.boolean(),
});

export const productListSchema = z.object({
  products: z.array(productSchema),
});

export type ProductList = z.infer<typeof productListSchema>;
