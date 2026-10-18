import { z } from "zod";
import { isoDateTimeSchema, jsonSchema, symptomSchema } from "./common.js";

export const postWorkoutLogSchema = z
  .object({
    id: z.string(),
    workoutId: z.string(),
    intakeCarbsG: z.number().int().nullable(),
    intakeItems: jsonSchema.nullable(),
    intakeTiming: jsonSchema.nullable(),
    fluidMl: z.number().int().nullable(),
    symptomUpper: symptomSchema.nullable(),
    symptomLower: symptomSchema.nullable(),
    symptomSystemic: symptomSchema.nullable(),
    feeling: z.string().nullable(),
    containerWeighIns: jsonSchema.nullable(),
    followedPrompts: z.boolean().nullable(),
    sipProposal: jsonSchema.nullable(),
    sweatPostWeightKg: z.number().nullable(),
    countsForPlan: z.boolean(),
    ladderEligible: z.boolean(),
    submittedAt: isoDateTimeSchema.nullable(),
  })
  .strict();

export const feedbackResponseSchema = z
  .object({
    log: postWorkoutLogSchema.nullable(),
  })
  .strict();

export type FeedbackResponse = z.infer<typeof feedbackResponseSchema>;
