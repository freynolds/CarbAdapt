import { z } from "zod";
import { connectionStatusSchema, dataProviderSchema, isoDateTimeSchema } from "./common.js";

export const connectionSchema = z
  .object({
    provider: dataProviderSchema,
    status: connectionStatusSchema,
    externalUserId: z.string().nullable(),
    lastSyncAt: isoDateTimeSchema.nullable(),
    scopes: z.string().nullable(),
  })
  .strict();

export const connectionListSchema = z
  .object({
    connections: z.array(connectionSchema),
  })
  .strict();

export type ConnectionList = z.infer<typeof connectionListSchema>;
