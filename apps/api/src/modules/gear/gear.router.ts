import { Router } from "express";
import type { PrismaClient } from "@carbadapt/db";
import { requireUser } from "../../http/session.js";
import { createGetContainerHandler, createListContainersHandler } from "./gear.controller.js";
import type { GearService } from "./gear.service.js";

/** Mounted at /containers. */
export function createGearRouter(service: GearService, db: PrismaClient): Router {
  const router = Router();
  const authed = requireUser(db);
  router.get("/", authed, createListContainersHandler(service));
  router.get("/:id", authed, createGetContainerHandler(service));
  return router;
}
