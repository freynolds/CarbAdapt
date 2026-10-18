import { z } from "zod";
import {
  arrivalSourceSchema,
  calendarDateSchema,
  carbLoadingChoiceSchema,
  isoDateTimeSchema,
  jsonSchema,
  loadingDaySchema,
  rehearsalStatusSchema,
  stageGapCaseSchema,
} from "./common.js";

export const aidStationSchema = z
  .object({
    id: z.string(),
    kmMark: z.number(),
    hasWater: z.boolean(),
    hasIsotonic: z.boolean(),
    hasGels: z.boolean(),
    stageId: z.string().nullable(),
  })
  .strict();

export const stageRecoverySchema = z
  .object({
    id: z.string(),
    stageId: z.string(),
    gapCase: stageGapCaseSchema,
    gapMin: z.number().int().nullable(),
    carbsTargetG: z.number().int(),
    proteinTargetG: z.number().int().nullable(),
    fluidTargetMl: z.number().int().nullable(),
    sodiumTargetMg: z.number().int().nullable(),
    sensitiveStomach: z.boolean(),
    meals: jsonSchema,
    engineVersion: z.string(),
  })
  .strict();

export const stageSchema = z
  .object({
    id: z.string(),
    index: z.number().int(),
    date: calendarDateSchema.nullable(),
    startAt: isoDateTimeSchema.nullable(),
    estimatedDurationMin: z.number().int(),
    type: z.string(),
    distanceKm: z.number().nullable(),
    elevationGainM: z.number().int().nullable(),
    activityId: z.string().nullable(),
    arrivalAt: isoDateTimeSchema.nullable(),
    arrivalSource: arrivalSourceSchema.nullable(),
    aidStations: z.array(aidStationSchema),
    recovery: stageRecoverySchema.nullable(),
  })
  .strict();

export const raceStrategySchema = z
  .object({
    id: z.string(),
    refillPoints: jsonSchema,
    description: z.string(),
    carryList: jsonSchema,
    chosen: z.boolean(),
  })
  .strict();

export const loadingDaySummarySchema = z
  .object({
    id: z.string(),
    day: loadingDaySchema,
    date: calendarDateSchema.nullable(),
    targetCarbsG: z.number().int(),
    isRehearsal: z.boolean(),
  })
  .strict();

export const rehearsalSchema = z
  .object({
    id: z.string(),
    date: calendarDateSchema.nullable(),
    status: rehearsalStatusSchema,
    longRideWorkoutId: z.string().nullable(),
    dismissedAt: isoDateTimeSchema.nullable(),
  })
  .strict();

export const raceSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    date: calendarDateSchema.nullable(),
    startAt: isoDateTimeSchema.nullable(),
    estimatedDurationMin: z.number().int(),
    type: z.string(),
    distanceKm: z.number().nullable(),
    elevationGainM: z.number().int().nullable(),
    carbLoading: carbLoadingChoiceSchema,
    isMultiStage: z.boolean(),
    stages: z.array(stageSchema),
    aidStations: z.array(aidStationSchema),
    strategies: z.array(raceStrategySchema),
    loadingDays: z.array(loadingDaySummarySchema),
    rehearsal: rehearsalSchema.nullable(),
  })
  .strict();

export const raceListSchema = z
  .object({
    races: z.array(raceSchema),
  })
  .strict();

export const raceResponseSchema = z
  .object({
    race: raceSchema,
  })
  .strict();

export const stageRecoveryResponseSchema = z
  .object({
    recovery: stageRecoverySchema.nullable(),
  })
  .strict();

export type Race = z.infer<typeof raceSchema>;
export type RaceList = z.infer<typeof raceListSchema>;
export type RaceResponse = z.infer<typeof raceResponseSchema>;
export type StageRecovery = z.infer<typeof stageRecoverySchema>;
export type StageRecoveryResponse = z.infer<typeof stageRecoveryResponseSchema>;
