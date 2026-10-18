import { Router } from "express";
import type { PrismaClient } from "@carbadapt/db";
import { requireUser } from "../../http/session.js";
import { createListConnectionsHandler } from "./connections.controller.js";
import type { ConnectionsService } from "./connections.service.js";

/** Mounted at /connections. */
export function createConnectionsRouter(service: ConnectionsService, db: PrismaClient): Router {
  const router = Router();
  router.get("/", requireUser(db), createListConnectionsHandler(service));
  return router;
}
