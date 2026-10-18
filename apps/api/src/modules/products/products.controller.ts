import type { RequestHandler } from "express";
import { routeParam, userId } from "../../http/session.js";
import { productListSchema, productResponseSchema } from "./products.schema.js";
import type { ProductsService } from "./products.service.js";

export function createListProductsHandler(service: ProductsService): RequestHandler {
  return async (req, res) => {
    res.status(200).json(productListSchema.parse(await service.listProducts(userId(req))));
  };
}

export function createGetProductHandler(service: ProductsService): RequestHandler {
  return async (req, res) => {
    const body = await service.getProduct(userId(req), routeParam(req.params.id, "product id"));
    res.status(200).json(productResponseSchema.parse(body));
  };
}
