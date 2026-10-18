import { Router } from "express";
import {
  createListAthletesHandler,
  createLoginAsHandler,
  createResetHandler,
} from "./dev.controller.js";
import type { DevService } from "./dev.service.js";

/** Mounted at /dev. The composition root only mounts this when APP_ENV is mock. */
export function createDevRouter(service: DevService): Router {
  const router = Router();
  router.post("/login-as", createLoginAsHandler(service));
  router.get("/athletes", createListAthletesHandler(service));
  router.post("/reset", createResetHandler(service));
  return router;
}
