import { Router } from "express";
import { createListProductsHandler } from "./products.controller.js";
import type { ProductsService } from "./products.service.js";

/** Mounted at /products. */
export function createProductsRouter(service: ProductsService): Router {
  const router = Router();
  router.get("/", createListProductsHandler(service));
  return router;
}
