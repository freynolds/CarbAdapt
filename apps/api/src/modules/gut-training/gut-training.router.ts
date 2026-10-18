import { Router } from "express";
import type { PrismaClient } from "@carbadapt/db";
import { requireUser } from "../../http/session.js";
import { createGetGutPlanHandler } from "./gut-training.controller.js";
import type { GutTrainingService } from "./gut-training.service.js";

/** Mounted at /gut-plan. */
export function createGutTrainingRouter(service: GutTrainingService, db: PrismaClient): Router {
  const router = Router();
  router.get("/", requireUser(db), createGetGutPlanHandler(service));
  return router;
}
