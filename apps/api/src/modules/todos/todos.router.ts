import { Router } from "express";
import type { PrismaClient } from "@carbadapt/db";
import { requireUser } from "../../http/session.js";
import { createListTodosHandler } from "./todos.controller.js";
import type { TodosService } from "./todos.service.js";

/** Mounted at /todos. */
export function createTodosRouter(service: TodosService, db: PrismaClient): Router {
  const router = Router();
  router.get("/", requireUser(db), createListTodosHandler(service));
  return router;
}
