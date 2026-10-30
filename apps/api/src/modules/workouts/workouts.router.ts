import { Router } from "express";
import type { PrismaClient } from "@carbadapt/db";
import { racePlanBodySchema, racePlanResponseSchema } from "@carbadapt/contracts";
import { getRacePlan, saveRacePlan } from "../../domain/race-plan.js";
import { parseInput } from "../../http/errors.js";
import { requireUser, routeParam, userId } from "../../http/session.js";
import {
  createCreateWorkoutHandler,
  createDeleteWorkoutHandler,
  createGetWorkoutHandler,
  createListWorkoutsHandler,
  createUpdateWorkoutHandler,
} from "./workouts.controller.js";
import type { WorkoutsService } from "./workouts.service.js";

/** Mounted at /workouts. */
export function createWorkoutsRouter(service: WorkoutsService, db: PrismaClient): Router {
  const router = Router();
  const authed = requireUser(db);
  router.get("/", authed, createListWorkoutsHandler(service));
  router.post("/", authed, createCreateWorkoutHandler(service));
  router.get("/:id/race-plan", authed, async (req, res) => {
    const id = routeParam(req.params.id, "workout id");
    res.status(200).json(racePlanResponseSchema.parse(await getRacePlan(db, userId(req), id)));
  });
  router.put("/:id/race-plan", authed, async (req, res) => {
    const id = routeParam(req.params.id, "workout id");
    const body = parseInput(racePlanBodySchema, req.body);
    res.status(200).json(racePlanResponseSchema.parse(await saveRacePlan(db, userId(req), id, body)));
  });
  router.get("/:id", authed, createGetWorkoutHandler(service));
  router.patch("/:id", authed, createUpdateWorkoutHandler(service));
  router.delete("/:id", authed, createDeleteWorkoutHandler(service));
  return router;
}
