import { Router } from "express";
import type { ProfileService } from "./profile.service.js";

export function createProfileRouter(_service: ProfileService): Router {
  return Router();
}
