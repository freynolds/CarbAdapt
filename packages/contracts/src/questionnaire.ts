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

/** Machine codes for where a questionnaire starting value came from. */
export const prefillSourceSchema = z.enum(["plan", "working_rate", "not_set"]);

export const intakePrefillSchema = z
  .object({
    carbsG: z.number().int().nullable(),
    fluidMl: z.number().int().nullable(),
    carbSource: prefillSourceSchema,
    fluidSource: prefillSourceSchema,
  })
  .strict();

export const feedbackResponseSchema = z
  .object({
    log: postWorkoutLogSchema.nullable(),
    prefill: intakePrefillSchema,
  })
  .strict();

export type IntakePrefillResponse = z.infer<typeof intakePrefillSchema>;
export type FeedbackResponse = z.infer<typeof feedbackResponseSchema>;
