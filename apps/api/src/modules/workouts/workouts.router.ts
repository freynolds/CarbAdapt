import { Router } from "express";
import type { WorkoutsService } from "./workouts.service.js";

export function createWorkoutsRouter(_service: WorkoutsService): Router {
  return Router();
}
