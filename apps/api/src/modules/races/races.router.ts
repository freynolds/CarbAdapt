import { Router } from "express";
import type { PrismaClient } from "@carbadapt/db";
import { requireUser } from "../../http/session.js";
import {
  createGetRaceHandler,
  createGetStageRecoveryHandler,
  createListRacesHandler,
} from "./races.controller.js";
import type { RacesService } from "./races.service.js";

/** Mounted at /races. Stage recovery stays on this router. */
export function createRacesRouter(service: RacesService, db: PrismaClient): Router {
  const router = Router();
  const authed = requireUser(db);
  router.get("/", authed, createListRacesHandler(service));
  router.get("/stages/:stageId/recovery", authed, createGetStageRecoveryHandler(service));
  router.get("/:id", authed, createGetRaceHandler(service));
  return router;
}
