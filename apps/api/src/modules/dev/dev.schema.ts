import { z } from "zod";

export {
  devAthleteListSchema,
  devLoginResponseSchema,
  devResetResponseSchema,
} from "@carbadapt/contracts";

export const devLoginBodySchema = z
  .object({
    athleteId: z.string().min(1),
  })
  .strict();
