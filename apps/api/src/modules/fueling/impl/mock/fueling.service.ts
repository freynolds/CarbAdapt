import { adjustFueling } from "../../../../domain/commands.js";
import { HttpError, HttpErrorCode } from "../../../../http/errors.js";
import { presentFueling } from "../../../../http/present.js";
import type { ModuleDeps } from "../../../deps.js";
import type { FuelingService } from "../../fueling.service.js";

export function createMockFuelingService(deps: ModuleDeps): FuelingService {
  return {
    async getFuelingPlan(userId, workoutId) {
      const workout = await deps.db.workout.findFirst({
        where: { id: workoutId, userId },
        include: { fuelingPlans: true },
      });
      if (!workout) throw new HttpError(HttpErrorCode.WorkoutNotFound);
      const plan = workout.fuelingPlans.find((item) => item.isCurrent) ?? null;
      return { fuelingPlan: plan ? presentFueling(plan) : null };
    },
    adjustFueling: (userId, workoutId, body) => adjustFueling(deps.db, userId, workoutId, body),
  };
}
