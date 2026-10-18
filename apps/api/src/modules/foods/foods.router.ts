import { Router } from "express";
import type { FoodsService } from "./foods.service.js";

export function createFoodsRouter(_service: FoodsService): Router {
  return Router();
}
