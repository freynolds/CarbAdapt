import { Router } from "express";
import type { PrismaClient } from "@carbadapt/db";
import { requireUser } from "../../http/session.js";
import { createGetProductHandler, createListProductsHandler } from "./products.controller.js";
import type { ProductsService } from "./products.service.js";

/** Mounted at /products. */
export function createProductsRouter(service: ProductsService, db: PrismaClient): Router {
  const router = Router();
  const authed = requireUser(db);
  router.get("/", authed, createListProductsHandler(service));
  router.get("/:id", authed, createGetProductHandler(service));
  return router;
}
