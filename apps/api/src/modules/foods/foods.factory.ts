import type { AppEnv } from "../../config/env.js";
import { createMockFoodsService } from "./impl/mock/foods.service.js";
import { createProductionFoodsService } from "./impl/production/foods.service.js";
import { createStagingFoodsService } from "./impl/staging/foods.service.js";
import type { FoodsService } from "./foods.service.js";

export function createFoodsService(env: AppEnv): FoodsService {
  switch (env) {
    case "mock":
      return createMockFoodsService();
    case "staging":
      return createStagingFoodsService();
    case "production":
      return createProductionFoodsService();
  }
}
