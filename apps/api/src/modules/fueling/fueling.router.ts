import { Router } from "express";
import type { FuelingService } from "./fueling.service.js";

export function createFuelingRouter(_service: FuelingService): Router {
  return Router();
}
