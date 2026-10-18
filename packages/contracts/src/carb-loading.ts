import { z } from "zod";
import { calendarDateSchema, jsonSchema, loadingDaySchema } from "./common.js";

export const loadingDayResponseSchema = z
  .object({
    loadingDay: z
      .object({
        id: z.string(),
        day: loadingDaySchema,
        date: calendarDateSchema.nullable(),
        gPerKg: z.number(),
        targetCarbsG: z.number().int(),
        meals: jsonSchema,
      })
      .strict(),
  })
  .strict();

export const breakfastResponseSchema = z
  .object({
    engineVersion: z.literal("fixture"),
    derived: z.literal(true),
    earlyStart: z.boolean(),
    gPerKg: z.number(),
    carbsG: z.number().int(),
    fluidMl: z.number().int(),
    isotonicMl: z.number().int(),
    waterMl: z.literal(0),
    sodiumMg: z.number().int(),
    drinkSodiumMgPerL: z.number().int(),
    note: z.string(),
  })
  .strict();

export type LoadingDayResponse = z.infer<typeof loadingDayResponseSchema>;
export type BreakfastResponse = z.infer<typeof breakfastResponseSchema>;
