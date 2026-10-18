import { Router } from "express";
import { createListFoodsHandler } from "./foods.controller.js";
import type { FoodsService } from "./foods.service.js";

/** Mounted at /foods. The catalog is shared, so this route does not require a session. */
export function createFoodsRouter(service: FoodsService): Router {
  const router = Router();
  router.get("/", createListFoodsHandler(service));
  return router;
}
