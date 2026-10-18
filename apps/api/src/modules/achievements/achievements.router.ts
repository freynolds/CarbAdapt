import { Router } from "express";
import type { PrismaClient } from "@carbadapt/db";
import { requireUser } from "../../http/session.js";
import {
  createGetProgressHandler,
  createListAchievementsHandler,
  createListPendingHandler,
} from "./achievements.controller.js";
import type { AchievementsService } from "./achievements.service.js";

/** Mounted at /achievements. */
export function createAchievementsRouter(service: AchievementsService, db: PrismaClient): Router {
  const router = Router();
  const authed = requireUser(db);
  router.get("/", authed, createListAchievementsHandler(service));
  router.get("/pending", authed, createListPendingHandler(service));
  router.get("/progress", authed, createGetProgressHandler(service));
  return router;
}
