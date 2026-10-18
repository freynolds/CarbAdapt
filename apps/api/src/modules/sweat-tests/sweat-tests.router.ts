import { Router } from "express";
import type { SweatTestsService } from "./sweat-tests.service.js";

export function createSweatTestsRouter(_service: SweatTestsService): Router {
  return Router();
}
