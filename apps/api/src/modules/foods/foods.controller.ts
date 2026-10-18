import type { RequestHandler } from "express";
import { parseInput } from "../../http/errors.js";
import { foodListSchema, foodQuerySchema } from "./foods.schema.js";
import type { FoodsService } from "./foods.service.js";

export function createListFoodsHandler(service: FoodsService): RequestHandler {
  return async (req, res) => {
    const query = parseInput(foodQuerySchema, req.query);
    const text = query.query?.trim();
    res.status(200).json(foodListSchema.parse(await service.listFoods(text || undefined)));
  };
}
