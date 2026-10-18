import { Router } from "express";
import type { PrismaClient } from "@carbadapt/db";
import { requireUser } from "../../http/session.js";
import { createGetFuelingPlanHandler } from "./fueling.controller.js";
import type { FuelingService } from "./fueling.service.js";

/** Mounted at /workouts, beside the workouts router. */
export function createFuelingRouter(service: FuelingService, db: PrismaClient): Router {
  const router = Router();
  router.get("/:id/fueling-plan", requireUser(db), createGetFuelingPlanHandler(service));
  return router;
}
