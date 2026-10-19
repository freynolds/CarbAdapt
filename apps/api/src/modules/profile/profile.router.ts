import { Router } from "express";
import type { PrismaClient } from "@carbadapt/db";
import { requireUser } from "../../http/session.js";
import {
  createDeleteMeHandler,
  createGetMeHandler,
  createGetPhysicalHandler,
  createListConflictsHandler,
  createPatchMeHandler,
  createPatchPhysicalHandler,
  createResolveConflictHandler,
} from "./profile.controller.js";
import type { ProfileService } from "./profile.service.js";

/** Mounted at /me. */
export function createProfileRouter(service: ProfileService, db: PrismaClient): Router {
  const router = Router();
  const authed = requireUser(db);
  router.get("/", authed, createGetMeHandler(service));
  router.patch("/", authed, createPatchMeHandler(service));
  router.delete("/", authed, createDeleteMeHandler(service));
  router.get("/physical-data", authed, createGetPhysicalHandler(service));
  router.patch("/physical-data", authed, createPatchPhysicalHandler(service));
  router.get("/conflicts", authed, createListConflictsHandler(service));
  router.post("/conflicts/:id/resolve", authed, createResolveConflictHandler(service));
  return router;
}
