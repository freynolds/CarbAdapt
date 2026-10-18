import { z } from "zod";
import {
  achievementTypeSchema,
  calendarDateSchema,
  isoDateTimeSchema,
  symptomSchema,
} from "./common.js";

export const achievementSchema = z
  .object({
    id: z.string(),
    type: achievementTypeSchema,
    valueGh: z.number().int(),
    workoutId: z.string().nullable(),
    achievedAt: isoDateTimeSchema.nullable(),
    celebratedAt: isoDateTimeSchema.nullable(),
  })
  .strict();

export const achievementListSchema = z
  .object({
    achievements: z.array(achievementSchema),
  })
  .strict();

export const progressSessionSchema = z
  .object({
    logId: z.string(),
    workoutId: z.string(),
    name: z.string(),
    plannedDate: calendarDateSchema.nullable(),
    intakeCarbsG: z.number().int().nullable(),
    planCarbsG: z.number().int().nullable(),
    symptomUpper: symptomSchema.nullable(),
    symptomLower: symptomSchema.nullable(),
    symptomSystemic: symptomSchema.nullable(),
    countsForPlan: z.boolean(),
    ladderEligible: z.boolean(),
    engineVersion: z.string().nullable(),
  })
  .strict();

export const progressResponseSchema = z
  .object({
    toleratedGh: z.number().int().nullable(),
    streak: z.number().int(),
    achievements: z.array(achievementSchema),
    sessions: z.array(progressSessionSchema),
  })
  .strict();

export type AchievementList = z.infer<typeof achievementListSchema>;
export type ProgressResponse = z.infer<typeof progressResponseSchema>;
