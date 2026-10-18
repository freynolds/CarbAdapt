import type { FuelingPlanResponse } from "@carbadapt/contracts";

/** The current fueling plan for one workout. Math stays in packages/engine. */
export interface FuelingService {
  getFuelingPlan(userId: string, workoutId: string): Promise<FuelingPlanResponse>;
}
