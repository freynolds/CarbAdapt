import { Router } from "express";
import type { PrismaClient } from "@carbadapt/db";
import { requireUser } from "../../http/session.js";
import {
  createGetMeHandler,
  createGetPhysicalHandler,
  createListConflictsHandler,
} from "./profile.controller.js";
import type { ProfileService } from "./profile.service.js";

/** Mounted at /me. */
export function createProfileRouter(service: ProfileService, db: PrismaClient): Router {
  const router = Router();
  const authed = requireUser(db);
  router.get("/", authed, createGetMeHandler(service));
  router.get("/physical-data", authed, createGetPhysicalHandler(service));
  router.get("/conflicts", authed, createListConflictsHandler(service));
  return router;
}
