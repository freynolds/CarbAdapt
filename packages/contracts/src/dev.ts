import { z } from "zod";
import { isoDateTimeSchema, modeSchema } from "./common.js";
import { userSchema } from "./profile.js";

export const devLoginResponseSchema = z
  .object({
    token: z.string(),
    user: userSchema,
  })
  .strict();

export const devAthleteSchema = z
  .object({
    athleteId: z.string(),
    email: z.string().nullable(),
    name: z.string().nullable(),
    mode: modeSchema.nullable(),
    timezone: z.string(),
    deletedAt: isoDateTimeSchema.nullable(),
  })
  .strict();

export const devAthleteListSchema = z
  .object({
    athletes: z.array(devAthleteSchema),
  })
  .strict();

export const devResetResponseSchema = z
  .object({
    ok: z.literal(true),
    seededAt: isoDateTimeSchema,
  })
  .strict();

export type DevLoginResponse = z.infer<typeof devLoginResponseSchema>;
export type DevAthleteList = z.infer<typeof devAthleteListSchema>;
export type DevResetResponse = z.infer<typeof devResetResponseSchema>;
