import { z } from "zod";
import {
  adaptationOutcomeSchema,
  calendarDateSchema,
  gutTargetKindSchema,
  isoDateTimeSchema,
  jsonSchema,
  ladderStepStatusSchema,
  planStatusSchema,
} from "./common.js";

export const ladderStepSchema = z
  .object({
    id: z.string(),
    index: z.number().int(),
    gh: z.number().int(),
    approxDate: calendarDateSchema.nullable(),
    status: ladderStepStatusSchema,
  })
  .strict();

export const adaptationDecisionSchema = z
  .object({
    id: z.string(),
    outcome: adaptationOutcomeSchema,
    fromGh: z.number().int(),
    toGh: z.number().int(),
    inputLogIds: jsonSchema,
    reason: z.string().nullable(),
    engineVersion: z.string(),
    createdAt: isoDateTimeSchema.nullable(),
  })
  .strict();

export const gutPlanSchema = z
  .object({
    id: z.string(),
    targetKind: gutTargetKindSchema,
    raceId: z.string().nullable(),
    targetDate: calendarDateSchema.nullable(),
    startGh: z.number().int(),
    goalGh: z.number().int(),
    defaultGh: z.number().int().nullable(),
    tooFast: z.boolean(),
    status: planStatusSchema,
    engineVersion: z.string(),
    warningAbove120: z.boolean(),
    steps: z.array(ladderStepSchema),
    decisions: z.array(adaptationDecisionSchema),
  })
  .strict();

export const gutPlanResponseSchema = z
  .object({
    plan: gutPlanSchema.nullable(),
  })
  .strict();

export type GutPlanResponse = z.infer<typeof gutPlanResponseSchema>;
