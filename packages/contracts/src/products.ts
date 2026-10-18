import { z } from "zod";
import { isoDateTimeSchema, jsonSchema, productSourceSchema, productTypeSchema } from "./common.js";

export const productSchema = z
  .object({
    id: z.string(),
    type: productTypeSchema,
    name: z.string(),
    brand: z.string().nullable(),
    servingG: z.number().nullable(),
    scoopG: z.number().nullable(),
    carbsG: z.number(),
    sodiumMg: z.number().int().nullable(),
    caffeineMg: z.number().int().nullable(),
    label: jsonSchema.nullable(),
    favorite: z.boolean(),
    source: productSourceSchema,
    createdAt: isoDateTimeSchema.nullable(),
    deletedAt: isoDateTimeSchema.nullable(),
  })
  .strict();

export const productListSchema = z
  .object({
    products: z.array(productSchema),
  })
  .strict();

export const productResponseSchema = z
  .object({
    product: productSchema,
  })
  .strict();

export type Product = z.infer<typeof productSchema>;
export type ProductList = z.infer<typeof productListSchema>;
export type ProductResponse = z.infer<typeof productResponseSchema>;
