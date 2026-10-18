import type { AchievementList, ProgressResponse } from "@carbadapt/contracts";

/** g/h achievements and the progress summary built from stored logs. */
export interface AchievementsService {
  listAchievements(userId: string): Promise<AchievementList>;
  listPending(userId: string): Promise<AchievementList>;
  getProgress(userId: string): Promise<ProgressResponse>;
}
