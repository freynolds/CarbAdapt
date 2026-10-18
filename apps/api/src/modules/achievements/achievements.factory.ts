import type { AppEnv } from "../../config/env.js";
import { createMockAchievementsService } from "./impl/mock/achievements.service.js";
import { createProductionAchievementsService } from "./impl/production/achievements.service.js";
import { createStagingAchievementsService } from "./impl/staging/achievements.service.js";
import type { AchievementsService } from "./achievements.service.js";

export function createAchievementsService(env: AppEnv): AchievementsService {
  switch (env) {
    case "mock":
      return createMockAchievementsService();
    case "staging":
      return createStagingAchievementsService();
    case "production":
      return createProductionAchievementsService();
  }
}
