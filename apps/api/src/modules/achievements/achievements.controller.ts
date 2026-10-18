import type { RequestHandler } from "express";
import { userId } from "../../http/session.js";
import { achievementListSchema, progressResponseSchema } from "./achievements.schema.js";
import type { AchievementsService } from "./achievements.service.js";

export function createListAchievementsHandler(service: AchievementsService): RequestHandler {
  return async (req, res) => {
    const body = await service.listAchievements(userId(req));
    res.status(200).json(achievementListSchema.parse(body));
  };
}

export function createListPendingHandler(service: AchievementsService): RequestHandler {
  return async (req, res) => {
    const body = await service.listPending(userId(req));
    res.status(200).json(achievementListSchema.parse(body));
  };
}

export function createGetProgressHandler(service: AchievementsService): RequestHandler {
  return async (req, res) => {
    res.status(200).json(progressResponseSchema.parse(await service.getProgress(userId(req))));
  };
}
