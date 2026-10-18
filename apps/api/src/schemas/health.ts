import { z } from "zod";

/** Response body of GET /health. Liveness only: it does not check MySQL. */
export const healthResponseSchema = z.object({
  status: z.literal("ok"),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;
