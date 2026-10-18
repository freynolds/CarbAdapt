import { z } from "zod";
import { isoDateTimeSchema, jsonSchema } from "./common.js";

export const fuelingPlanSchema = z
  .object({
    id: z.string(),
    workoutId: z.string(),
    engineVersion: z.string(),
    targetGPerH: z.number().int().nullable(),
    totalCarbsG: z.number().int(),
    totalFluidMl: z.number().int(),
    totalSodiumMg: z.number().int(),
    schedule: jsonSchema,
    carryList: jsonSchema,
    userAdjusted: z.boolean(),
    isCurrent: z.boolean(),
    weather: jsonSchema.nullable(),
    createdAt: isoDateTimeSchema.nullable(),
  })
  .strict();

export const fuelingPlanResponseSchema = z
  .object({
    fuelingPlan: fuelingPlanSchema.nullable(),
  })
  .strict();

export type FuelingPlan = z.infer<typeof fuelingPlanSchema>;
export type FuelingPlanResponse = z.infer<typeof fuelingPlanResponseSchema>;
