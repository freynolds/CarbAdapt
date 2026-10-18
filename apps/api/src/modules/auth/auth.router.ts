import { Router } from "express";
import type { AuthService } from "./auth.service.js";

export function createAuthRouter(_service: AuthService): Router {
  return Router();
}
