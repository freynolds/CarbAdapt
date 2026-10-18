import { z } from "zod";
import { calendarDateSchema, isoDateTimeSchema, sweatTestStatusSchema } from "./common.js";
import { SWEAT_RATE_FORMULA } from "./messages.js";

export const sweatTestSchema = z
  .object({
    id: z.string(),
    workoutId: z.string().nullable(),
    status: sweatTestStatusSchema,
    scheduledFor: calendarDateSchema.nullable(),
    movedFrom: calendarDateSchema.nullable(),
    preWeightKg: z.number().nullable(),
    postWeightKg: z.number().nullable(),
    fluidMl: z.number().int().nullable(),
    urineMl: z.number().int().nullable(),
    startedAt: isoDateTimeSchema.nullable(),
    endedAt: isoDateTimeSchema.nullable(),
    temperatureC: z.number().nullable(),
    humidityPct: z.number().int().nullable(),
    sweatRateLPerH: z.number().nullable(),
    formula: z.literal(SWEAT_RATE_FORMULA),
  })
  .strict();

export const sweatTestListSchema = z
  .object({
    sweatTests: z.array(sweatTestSchema),
  })
  .strict();

export const sweatTestResponseSchema = z
  .object({
    sweatTest: sweatTestSchema,
  })
  .strict();

export type SweatTest = z.infer<typeof sweatTestSchema>;
export type SweatTestList = z.infer<typeof sweatTestListSchema>;
export type SweatTestResponse = z.infer<typeof sweatTestResponseSchema>;
