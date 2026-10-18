import { Router } from "express";
import type { CarbLoadingService } from "./carb-loading.service.js";

export function createCarbLoadingRouter(_service: CarbLoadingService): Router {
  return Router();
}
