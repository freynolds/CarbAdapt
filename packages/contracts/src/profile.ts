import { z } from "zod";
import {
  dataProviderSchema,
  isoDateTimeSchema,
  jsonSchema,
  localeSchema,
  modeSchema,
  subscriptionStatusSchema,
  themeSchema,
} from "./common.js";

export const userSchema = z
  .object({
    id: z.string(),
    email: z.string().nullable(),
    name: z.string().nullable(),
    locale: localeSchema,
    theme: themeSchema,
    timezone: z.string(),
    mode: modeSchema.nullable(),
    briefingTimeLocal: z.string().nullable(),
    briefingDayBefore: z.boolean(),
    deletedAt: isoDateTimeSchema.nullable(),
  })
  .strict();

export const physicalSchema = z
  .object({
    weightKg: z.number().nullable(),
    ftpW: z.number().int().nullable(),
    sweatRateLPerH: z.number().nullable(),
    sweatRateSource: z.string().nullable(),
    ghTolerance: z.number().int().nullable(),
    maxHr: z.number().int().nullable(),
    hrZones: jsonSchema.nullable(),
    age: z.number().int().nullable(),
    sex: z.string().nullable(),
    heightCm: z.number().int().nullable(),
    fieldSources: jsonSchema.nullable(),
    updatedAt: isoDateTimeSchema.nullable(),
  })
  .strict();

export const subscriptionSchema = z
  .object({
    status: subscriptionStatusSchema,
  })
  .strict();

export const meResponseSchema = z
  .object({
    user: userSchema,
    physical: physicalSchema.nullable(),
    subscription: subscriptionSchema.nullable(),
  })
  .strict();

export const physicalResponseSchema = z
  .object({
    physical: physicalSchema.nullable(),
  })
  .strict();

export const conflictSchema = z
  .object({
    id: z.string(),
    field: z.string(),
    manualValue: jsonSchema,
    syncedValue: jsonSchema,
    provider: dataProviderSchema,
    resolvedWith: z.string().nullable(),
    resolvedAt: isoDateTimeSchema.nullable(),
  })
  .strict();

export const conflictListSchema = z
  .object({
    conflicts: z.array(conflictSchema),
  })
  .strict();

export type User = z.infer<typeof userSchema>;
export type Physical = z.infer<typeof physicalSchema>;
export type MeResponse = z.infer<typeof meResponseSchema>;
export type PhysicalResponse = z.infer<typeof physicalResponseSchema>;
export type ConflictList = z.infer<typeof conflictListSchema>;
