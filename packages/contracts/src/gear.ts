import { z } from "zod";
import {
  containerContentSchema,
  containerTypeSchema,
  isoDateTimeSchema,
  jsonSchema,
} from "./common.js";

export const calibrationSchema = z
  .object({
    id: z.string(),
    weightsG: jsonSchema,
    mlPerSip: z.number().nullable(),
    gPerSqueeze: z.number().nullable(),
    validationsLeft: z.number().int(),
    createdAt: isoDateTimeSchema.nullable(),
  })
  .strict();

export const containerSchema = z
  .object({
    id: z.string(),
    type: containerTypeSchema,
    name: z.string(),
    colorHex: z.string().nullable(),
    capacityMl: z.number().int(),
    usualContent: containerContentSchema,
    createdAt: isoDateTimeSchema.nullable(),
    calibrations: z.array(calibrationSchema),
  })
  .strict();

export const containerListSchema = z
  .object({
    containers: z.array(containerSchema),
  })
  .strict();

export const containerResponseSchema = z
  .object({
    container: containerSchema,
  })
  .strict();

export type ContainerList = z.infer<typeof containerListSchema>;
export type ContainerResponse = z.infer<typeof containerResponseSchema>;
