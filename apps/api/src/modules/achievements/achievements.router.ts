import { Router } from "express";
import type { AchievementsService } from "./achievements.service.js";

export function createAchievementsRouter(_service: AchievementsService): Router {
  return Router();
}
