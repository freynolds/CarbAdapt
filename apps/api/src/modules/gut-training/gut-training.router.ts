import { Router } from "express";
import type { GutTrainingService } from "./gut-training.service.js";

export function createGutTrainingRouter(_service: GutTrainingService): Router {
  return Router();
}
