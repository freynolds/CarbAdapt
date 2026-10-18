import { Router } from "express";
import type { PrismaClient } from "@carbadapt/db";
import { requireUser } from "../../http/session.js";
import {
  createGetBreakfastHandler,
  createGetLoadingDayHandler,
} from "./carb-loading.controller.js";
import type { CarbLoadingService } from "./carb-loading.service.js";

/** Mounted at /races, beside the races router. */
export function createCarbLoadingRouter(service: CarbLoadingService, db: PrismaClient): Router {
  const router = Router();
  const authed = requireUser(db);
  router.get("/:raceId/loading/:day", authed, createGetLoadingDayHandler(service));
  router.get("/:raceId/breakfast", authed, createGetBreakfastHandler(service));
  return router;
}
