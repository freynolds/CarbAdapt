import { z } from "zod";
import { fodmapSchema } from "./common.js";

export const foodSchema = z
  .object({
    id: z.number().int(),
    fdcId: z.number().int(),
    name: z.string(),
    category: z.string().nullable(),
    carbsPer100g: z.number(),
    proteinPer100g: z.number().nullable(),
    fatPer100g: z.number().nullable(),
    fiberPer100g: z.number().nullable(),
    sodiumMgPer100g: z.number().int().nullable(),
    portionG: z.number().nullable(),
    portionLabel: z.string().nullable(),
    fodmap: fodmapSchema.nullable(),
  })
  .strict();

export const foodListSchema = z
  .object({
    foods: z.array(foodSchema),
  })
  .strict();

export type FoodList = z.infer<typeof foodListSchema>;
