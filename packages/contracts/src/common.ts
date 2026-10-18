import { z } from "zod";
import { ConnectionStatus, DataProvider } from "./messages.js";

/** Calendar date stored as UTC midnight, rendered YYYY-MM-DD. */
export const calendarDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

/** UTC timestamp from Date#toISOString. */
export const isoDateTimeSchema = z.string().min(1);

/** Prisma JSON columns. The value is returned as stored. */
export const jsonSchema = z.unknown();

export const localeSchema = z.enum(["EN_US", "ES", "PT"]);
export const themeSchema = z.enum(["SYSTEM", "LIGHT", "DARK"]);
export const modeSchema = z.enum(["FUEL_MY_WORKOUTS", "GUT_TRAINING"]);
export const sportSchema = z.enum(["CYCLING", "RUNNING", "TRAIL_RUNNING", "OTHER"]);
export const workoutTypeSchema = z.enum(["BASE", "THRESHOLD", "VO2MAX", "ANAEROBIC", "RECOVERY"]);
export const workoutKindSchema = z.enum(["STANDARD", "SWEAT_TEST"]);
export const workoutSourceSchema = z.enum(["MANUAL", "TRAININGPEAKS", "GARMIN", "STRAVA"]);
export const workoutStatusSchema = z.enum(["PLANNED", "COMPLETED", "SKIPPED"]);
export const symptomSchema = z.enum(["NONE", "MILD", "MODERATE", "SEVERE"]);
export const dataProviderSchema = z.enum(DataProvider);
export const connectionStatusSchema = z.enum(ConnectionStatus);
export const containerTypeSchema = z.enum(["BOTTLE", "SOFT_FLASK", "BLADDER"]);
export const containerContentSchema = z.enum(["WATER", "ISOTONIC", "GEL_CONCENTRATE"]);
export const productTypeSchema = z.enum(["DRINK_MIX", "GEL", "SOLID"]);
export const productSourceSchema = z.enum(["SCAN", "MANUAL"]);
export const fodmapSchema = z.enum(["LOW", "HIGH"]);
export const sweatTestStatusSchema = z.enum([
  "SCHEDULED",
  "IN_PROGRESS",
  "AWAITING_DATA",
  "COMPLETED",
  "RESCHEDULED",
]);
export const planStatusSchema = z.enum(["ACTIVE", "COMPLETED", "ARCHIVED"]);
export const ladderStepStatusSchema = z.enum(["DONE", "CURRENT", "UPCOMING"]);
export const adaptationOutcomeSchema = z.enum(["ADVANCE", "HOLD", "STEP_BACK"]);
export const gutTargetKindSchema = z.enum(["RACE", "DATE"]);
export const carbLoadingChoiceSchema = z.enum(["NONE", "TWO_DAY", "ONE_DAY"]);
export const loadingDaySchema = z.enum(["D_MINUS_2", "D_MINUS_1"]);
export const rehearsalStatusSchema = z.enum(["SUGGESTED", "DISMISSED", "DONE"]);
export const stageGapCaseSchema = z.enum(["UNDER_4H", "H4_TO_12H", "OVERNIGHT", "REST_DAY"]);
export const arrivalSourceSchema = z.enum(["PLATFORM_WEBHOOK", "FALLBACK_TIMER"]);
export const achievementTypeSchema = z.enum(["GH_INCREASE"]);
export const todoTypeSchema = z.enum([
  "LAST_SESSION_FEEDBACK",
  "SIP_CALIBRATION",
  "SIP_VALIDATION",
  "SWEAT_TEST",
  "COMPLETE_PROFILE",
  "ADD_BOTTLE",
  "ADD_RACE",
  "CONNECT_CALENDAR",
  "PRE_RACE_STRATEGY",
  "DATA_CONFLICT",
  "ESTIMATE_GH",
  "LOADING_REHEARSAL",
]);
export const todoTierSchema = z.enum(["HIGHEST", "CALIBRATION", "LOWER"]);
export const todoStatusSchema = z.enum(["OPEN", "DONE", "DISMISSED"]);
export const subscriptionStatusSchema = z.enum(["BETA_ALL_ACCESS"]);
