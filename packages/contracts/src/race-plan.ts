import { z } from "zod";

export const raceFluidPointSchema = z
  .object({
    km: z.number(),
    minute: z.number().int(),
    remainingMl: z.number().int(),
    kind: z.enum(["start", "sample", "refill", "run_out", "finish"]),
  })
  .strict();

export const racePlanRefillSchema = z
  .object({
    km: z.number(),
    addedMl: z.number().int(),
  })
  .strict();

export const racePlanSchema = z
  .object({
    workoutId: z.string(),
    stageId: z.string(),
    saved: z.boolean(),
    distanceKm: z.number().nullable(),
    durationMin: z.number().int(),
    sweatRateLPerH: z.number().nullable(),
    ownedFluidMl: z.number().int(),
    extraBottlesMl: z.array(z.number().int()),
    refillKm: z.array(z.number()),
    courseAidKm: z.array(z.number()),
    carriedMl: z.number().int(),
    neededMl: z.number().int().nullable(),
    missingMl: z.number().int().nullable(),
    enough: z.boolean().nullable(),
    computable: z.boolean(),
    runOutKm: z.number().nullable(),
    runOutMin: z.number().int().nullable(),
    stationsReachedKm: z.array(z.number()),
    stationsMissedKm: z.array(z.number()),
    refills: z.array(racePlanRefillSchema),
    points: z.array(raceFluidPointSchema),
  })
  .strict();

export const racePlanResponseSchema = z
  .object({
    racePlan: racePlanSchema,
  })
  .strict();

export const racePlanBodySchema = z
  .object({
    extraBottlesMl: z.array(z.number().int().positive().max(5000)).max(12),
    refillKm: z.array(z.number().positive().max(10000)).max(30),
    distanceKm: z.number().positive().max(10000).optional(),
    durationMin: z.number().int().positive().max(10080).optional(),
  })
  .strict();

export type RacePlan = z.infer<typeof racePlanSchema>;
export type RacePlanResponse = z.infer<typeof racePlanResponseSchema>;
