import type { FuelingPlanResponse } from "@carbadapt/contracts";
import type { z } from "zod";
import type { patchFuelingSchema } from "../../domain/schemas.js";

/** The current fueling plan for one workout. Math stays in packages/engine. */
export interface FuelingService {
  getFuelingPlan(userId: string, workoutId: string): Promise<FuelingPlanResponse>;
  adjustFueling(userId: string, workoutId: string, body: z.infer<typeof patchFuelingSchema>): Promise<FuelingPlanResponse>;
}
