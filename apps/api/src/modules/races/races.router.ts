import { Router } from "express";
import type { RacesService } from "./races.service.js";

export function createRacesRouter(_service: RacesService): Router {
  return Router();
}
