import { z } from "zod";
import { calendarDateSchema } from "@carbadapt/contracts";

export { workoutListSchema, workoutResponseSchema } from "@carbadapt/contracts";

export const workoutRangeQuerySchema = z.object({
  from: calendarDateSchema.optional(),
  to: calendarDateSchema.optional(),
});
