import { z } from "zod";
import { calendarDateSchema, jsonSchema, loadingDaySchema } from "./common.js";
import { BreakfastNote } from "./messages.js";

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
    engineVersion: z.string(),
    derived: z.literal(true),
    earlyStart: z.boolean().nullable(),
    gPerKg: z.number(),
    carbsG: z.number().int(),
    fluidMl: z.number().int().nullable(),
    isotonicMl: z.number().int().nullable(),
    waterMl: z.number().int().nullable(),
    sodiumMg: z.number().int().nullable(),
    drinkSodiumMgPerL: z.number().int().nullable(),
    note: z.enum(BreakfastNote),
  })
  .strict();

export type LoadingDayResponse = z.infer<typeof loadingDayResponseSchema>;
export type BreakfastResponse = z.infer<typeof breakfastResponseSchema>;
