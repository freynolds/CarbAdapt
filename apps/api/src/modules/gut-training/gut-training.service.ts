import type { GutPlanResponse } from "@carbadapt/contracts";

/** Active gut plan and its ladder. The newest plan is used when none is active. */
export interface GutTrainingService {
  getPlan(userId: string): Promise<GutPlanResponse>;
}
