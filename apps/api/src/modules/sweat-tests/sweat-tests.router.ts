import { Router } from "express";
import type { PrismaClient } from "@carbadapt/db";
import { requireUser } from "../../http/session.js";
import {
  createGetSweatTestHandler,
  createListSweatTestsHandler,
} from "./sweat-tests.controller.js";
import type { SweatTestsService } from "./sweat-tests.service.js";

/** Mounted at /sweat-tests. */
export function createSweatTestsRouter(service: SweatTestsService, db: PrismaClient): Router {
  const router = Router();
  const authed = requireUser(db);
  router.get("/", authed, createListSweatTestsHandler(service));
  router.get("/:id", authed, createGetSweatTestHandler(service));
  return router;
}
