import type { RequestHandler } from "express";
import { productListSchema } from "./products.schema.js";
import type { ProductsService } from "./products.service.js";

export function createListProductsHandler(service: ProductsService): RequestHandler {
  return async (_req, res) => {
    const body = productListSchema.parse(await service.listProducts());
    res.status(200).json(body);
  };
}
