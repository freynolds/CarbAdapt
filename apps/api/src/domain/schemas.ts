import { z } from "zod";
import {
  carbLoadingChoiceSchema,
  carbSplitSchema,
  containerContentSchema,
  containerTypeSchema,
  fluidPlanSchema,
  localeSchema,
  modeSchema,
  productTypeSchema,
  sportSchema,
  symptomSchema,
  themeSchema,
  workoutTypeSchema,
} from "@carbadapt/contracts";

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const patchMeSchema = z
  .object({
    name: z.string().nullable().optional(),
    locale: localeSchema.optional(),
    theme: themeSchema.optional(),
    timezone: z.string().min(1).optional(),
    mode: modeSchema.nullable().optional(),
    carbSplit: carbSplitSchema.optional(),
    fluidPlan: fluidPlanSchema.optional(),
    briefingTimeLocal: z
      .string()
      .regex(/^\d{2}:\d{2}$/)
      .nullable()
      .optional(),
    briefingDayBefore: z.boolean().optional(),
  })
  .strict();

export const patchPhysicalSchema = z
  .object({
    weightKg: z.number().positive().nullable().optional(),
    ftpW: z.number().int().positive().nullable().optional(),
    maxHr: z.number().int().positive().nullable().optional(),
    age: z.number().int().positive().nullable().optional(),
    sex: z.string().nullable().optional(),
    heightCm: z.number().int().positive().nullable().optional(),
    hrZones: z.unknown().nullable().optional(),
    ghTolerance: z.number().int().nonnegative().nullable().optional(),
  })
  .strict();

export const resolveConflictSchema = z
  .object({
    resolvedWith: z.enum(["manual", "synced"]),
  })
  .strict();

export const containerBodySchema = z
  .object({
    type: containerTypeSchema,
    name: z.string().min(1),
    colorHex: z.string().nullable().optional(),
    capacityMl: z.number().int().positive(),
    usualContent: containerContentSchema,
  })
  .strict();

export const calibrationBodySchema = z
  .object({
    weightsG: z.array(z.number()).length(4),
  })
  .strict();

export const productBodySchema = z
  .object({
    type: productTypeSchema,
    name: z.string().min(1),
    brand: z.string().nullable().optional(),
    servingG: z.number().positive().nullable().optional(),
    scoopG: z.number().positive().nullable().optional(),
    carbsG: z.number().nonnegative(),
    sodiumMg: z.number().int().nonnegative().nullable().optional(),
    caffeineMg: z.number().int().nonnegative().nullable().optional(),
    favorite: z.boolean().optional(),
    label: z.unknown().nullable().optional(),
  })
  .strict();

export const deleteProductSchema = z
  .object({
    replacementId: z.string().optional(),
  })
  .strict();

export const workoutBodySchema = z
  .object({
    name: z.string().min(1),
    sport: sportSchema,
    workoutType: workoutTypeSchema.nullable().optional(),
    plannedDate: day,
    durationMin: z.number().int().positive().nullable().optional(),
    plannedStart: z.string().datetime().nullable().optional(),
    kind: z.enum(["STANDARD", "SWEAT_TEST"]).optional(),
  })
  .strict();

export const patchWorkoutSchema = workoutBodySchema.partial().strict();

export const patchFuelingSchema = z
  .object({
    targetGPerH: z.number().int().nonnegative(),
  })
  .strict();

export const feedbackBodySchema = z
  .object({
    intakeCarbsG: z.number().int().nonnegative().nullable().optional(),
    fluidMl: z.number().int().nonnegative().nullable().optional(),
    symptomUpper: symptomSchema.nullable().optional(),
    symptomLower: symptomSchema.nullable().optional(),
    symptomSystemic: symptomSchema.nullable().optional(),
    feeling: z.string().nullable().optional(),
    followedPrompts: z.boolean().nullable().optional(),
    countsForPlan: z.boolean().optional(),
    intakeItems: z.unknown().optional(),
    intakeTiming: z.unknown().optional(),
    containerWeighIns: z.unknown().optional(),
    sipProposal: z.unknown().optional(),
    sweatPostWeightKg: z.number().nullable().optional(),
  })
  .strict();

export const gutBodySchema = z
  .object({
    targetKind: z.enum(["RACE", "DATE"]),
    raceId: z.string().nullable().optional(),
    targetDate: day,
    startGh: z.number().int().nonnegative(),
    goalGh: z.number().int().positive(),
    sessionsPerWeek: z.number().positive().nullable().optional(),
  })
  .strict();

export const startingPointBodySchema = z
  .object({
    entries: z.array(
      z
        .object({
          carbsG: z.number().nonnegative(),
          durationMin: z.number().positive(),
          symptom: symptomSchema,
        })
        .strict(),
    ),
  })
  .strict();

export const sweatCreateSchema = z
  .object({
    scheduledFor: day,
    workoutId: z.string().optional(),
  })
  .strict();

export const sweatStartSchema = z
  .object({
    preWeightKg: z.number().positive(),
  })
  .strict();

export const sweatRecordSchema = z
  .object({
    preWeightKg: z.number().positive(),
    postWeightKg: z.number().positive(),
    fluidMl: z.number().int().nonnegative(),
    urineMl: z.number().int().nonnegative().optional(),
    durationMin: z.number().int().positive().optional(),
    temperatureC: z.number().nullable().optional(),
    humidityPct: z.number().int().nullable().optional(),
  })
  .strict();

export const sweatCompleteSchema = z
  .object({
    postWeightKg: z.number().positive(),
    fluidMl: z.number().int().nonnegative(),
    urineMl: z.number().int().nonnegative().optional(),
    temperatureC: z.number().nullable().optional(),
    humidityPct: z.number().int().nullable().optional(),
  })
  .strict();

const aidSchema = z
  .object({
    kmMark: z.number().nonnegative(),
    hasWater: z.boolean().optional(),
    hasIsotonic: z.boolean().optional(),
    hasGels: z.boolean().optional(),
  })
  .strict();

const stageSchema = z
  .object({
    date: day,
    startAt: z.string().datetime(),
    estimatedDurationMin: z.number().int().positive(),
    type: z.string().min(1),
    distanceKm: z.number().nonnegative().nullable().optional(),
    elevationGainM: z.number().int().nonnegative().nullable().optional(),
    aidStations: z.array(aidSchema).optional(),
  })
  .strict();

export const raceBodySchema = z
  .object({
    name: z.string().min(1),
    date: day,
    startAt: z.string().datetime().nullable().optional(),
    estimatedDurationMin: z.number().int().positive(),
    type: z.string().min(1),
    distanceKm: z.number().nonnegative().nullable().optional(),
    elevationGainM: z.number().int().nonnegative().nullable().optional(),
    carbLoading: carbLoadingChoiceSchema.optional(),
    isMultiStage: z.boolean().optional(),
    stages: z.array(stageSchema).optional(),
    aidStations: z.array(aidSchema).optional(),
  })
  .strict();

export const patchRaceSchema = raceBodySchema.partial().strict();

export const recoveryPatchSchema = z
  .object({
    sensitiveStomach: z.boolean(),
  })
  .strict();

export const todoPatchSchema = z
  .object({
    status: z.enum(["DONE", "DISMISSED"]),
  })
  .strict();

export const magicLinkSchema = z
  .object({
    email: z.string().email(),
  })
  .strict();

export const magicVerifySchema = z
  .object({
    token: z.string().min(1),
    timezone: z.string().min(1),
    name: z.string().optional(),
  })
  .strict();

export const onboardingSchema = z
  .object({
    anonId: z.string().min(1),
    answers: z.record(z.string(), z.unknown()),
  })
  .strict();

export const claimSchema = z
  .object({
    anonId: z.string().min(1),
  })
  .strict();

export const webhookBodySchema = z
  .object({
    externalId: z.string().min(1),
    eventType: z.string().min(1),
    ownerId: z.string().optional(),
    stageId: z.string().optional(),
    workoutId: z.string().optional(),
    startAt: z.string().datetime().optional(),
    durationMin: z.number().int().positive().optional(),
  })
  .strict();

export const providerSchema = z.enum(["STRAVA", "TRAININGPEAKS", "GARMIN"]);
