import { z } from "zod";
import {
  calendarDateSchema,
  dataProviderSchema,
  isoDateTimeSchema,
  jsonSchema,
  sportSchema,
  workoutKindSchema,
  workoutSourceSchema,
  workoutStatusSchema,
  workoutTypeSchema,
} from "./common.js";
import { fuelingPlanSchema } from "./fueling.js";

export const activitySchema = z
  .object({
    id: z.string(),
    provider: dataProviderSchema,
    externalId: z.string(),
    dedupeGroup: z.string().nullable(),
    summary: jsonSchema.nullable(),
    startAt: isoDateTimeSchema.nullable(),
    durationMin: z.number().int(),
  })
  .strict();

export const workoutSchema = z
  .object({
    id: z.string(),
    source: workoutSourceSchema,
    externalId: z.string().nullable(),
    sport: sportSchema,
    kind: workoutKindSchema,
    workoutType: workoutTypeSchema.nullable(),
    name: z.string(),
    plannedStart: isoDateTimeSchema.nullable(),
    plannedDate: calendarDateSchema.nullable(),
    durationMin: z.number().int().nullable(),
    structure: jsonSchema.nullable(),
    status: workoutStatusSchema,
    stageId: z.string().nullable(),
    needsIntake: z.boolean(),
    activity: activitySchema.nullable(),
    fuelingPlan: fuelingPlanSchema.nullable(),
  })
  .strict();

export const workoutListSchema = z
  .object({
    workouts: z.array(workoutSchema),
  })
  .strict();

export const workoutResponseSchema = z
  .object({
    workout: workoutSchema,
  })
  .strict();

export type Workout = z.infer<typeof workoutSchema>;
export type WorkoutList = z.infer<typeof workoutListSchema>;
export type WorkoutResponse = z.infer<typeof workoutResponseSchema>;
