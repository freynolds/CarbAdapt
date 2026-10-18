import { Router } from "express";
import type { PrismaClient } from "@carbadapt/db";
import { requireUser } from "../../http/session.js";
import { createGetHomeHandler } from "./home.controller.js";
import type { HomeService } from "./home.service.js";

/** Mounted at /. */
export function createHomeRouter(service: HomeService, db: PrismaClient): Router {
  const router = Router();
  router.get("/home", requireUser(db), createGetHomeHandler(service));
  return router;
}
