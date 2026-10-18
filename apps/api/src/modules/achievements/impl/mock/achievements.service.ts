import { day } from "../../../../http/values.js";
import { presentAchievement } from "../../../../http/present.js";
import type { ModuleDeps } from "../../../deps.js";
import type { AchievementsService } from "../../achievements.service.js";

export function createMockAchievementsService(deps: ModuleDeps): AchievementsService {
  const { db } = deps;
  return {
    async listAchievements(userId) {
      const rows = await db.achievement.findMany({
        where: { userId },
        orderBy: { achievedAt: "asc" },
      });
      return { achievements: rows.map(presentAchievement) };
    },
    async listPending(userId) {
      const rows = await db.achievement.findMany({
        where: { userId, celebratedAt: null },
        orderBy: { achievedAt: "asc" },
      });
      return { achievements: rows.map(presentAchievement) };
    },
    async getProgress(userId) {
      const physical = await db.physicalData.findUnique({ where: { userId } });
      const achievements = await db.achievement.findMany({
        where: { userId },
        orderBy: { achievedAt: "asc" },
      });
      const logs = await db.postWorkoutLog.findMany({
        where: { workout: { userId } },
        include: { workout: { include: { fuelingPlans: true } } },
        orderBy: [{ workout: { plannedDate: "desc" } }, { submittedAt: "desc" }],
      });
      let streak = 0;
      for (const log of logs) {
        const plan = log.workout.fuelingPlans.find((item) => item.isCurrent);
        if (!plan || log.intakeCarbsG == null) continue;
        const symptoms = [log.symptomUpper, log.symptomLower, log.symptomSystemic];
        if (symptoms.some((item) => item == null)) continue;
        const mild = symptoms.every((item) => item === "NONE" || item === "MILD");
        if (!mild || log.intakeCarbsG < plan.totalCarbsG) break;
        streak += 1;
      }
      return {
        toleratedGh: physical?.ghTolerance ?? null,
        streak,
        achievements: achievements.map(presentAchievement),
        sessions: logs.map((log) => {
          const plan = log.workout.fuelingPlans.find((item) => item.isCurrent) ?? null;
          return {
            logId: log.id,
            workoutId: log.workoutId,
            name: log.workout.name,
            plannedDate: day(log.workout.plannedDate),
            intakeCarbsG: log.intakeCarbsG,
            planCarbsG: plan?.totalCarbsG ?? null,
            symptomUpper: log.symptomUpper,
            symptomLower: log.symptomLower,
            symptomSystemic: log.symptomSystemic,
            countsForPlan: log.countsForPlan,
            ladderEligible: log.ladderEligible,
            engineVersion: plan?.engineVersion ?? null,
          };
        }),
      };
    },
  };
}
