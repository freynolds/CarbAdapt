import { Router } from "express";
import type { GearService } from "./gear.service.js";

export function createGearRouter(_service: GearService): Router {
  return Router();
}
