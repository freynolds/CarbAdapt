import type { AchievementsService } from "../../achievements.service.js";

export function createMockAchievementsService(): AchievementsService {
  return { module: "achievements" };
}
