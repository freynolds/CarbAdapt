import { planInclude, presentPlan } from "../../../../http/present.js";
import type { ModuleDeps } from "../../../deps.js";
import type { GutTrainingService } from "../../gut-training.service.js";

export function createMockGutTrainingService(deps: ModuleDeps): GutTrainingService {
  const { db } = deps;
  return {
    async getPlan(userId) {
      const active = await db.gutTrainingPlan.findFirst({
        where: { userId, status: "ACTIVE" },
        include: planInclude,
        orderBy: { createdAt: "desc" },
      });
      const plan =
        active ??
        (await db.gutTrainingPlan.findFirst({
          where: { userId },
          include: planInclude,
          orderBy: { createdAt: "desc" },
        }));
      return { plan: plan ? presentPlan(plan) : null };
    },
  };
}
