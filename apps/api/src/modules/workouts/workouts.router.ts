import { Router } from "express";
import type { PrismaClient } from "@carbadapt/db";
import { requireUser } from "../../http/session.js";
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
  router.get("/:id", authed, createGetWorkoutHandler(service));
  router.patch("/:id", authed, createUpdateWorkoutHandler(service));
  router.delete("/:id", authed, createDeleteWorkoutHandler(service));
  return router;
}
