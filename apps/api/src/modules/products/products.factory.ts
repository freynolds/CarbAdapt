import type { AppEnv } from "../../config/env.js";
import { createMockProductsService } from "./impl/mock/products.service.js";
import { createProductionProductsService } from "./impl/production/products.service.js";
import { createStagingProductsService } from "./impl/staging/products.service.js";
import type { ProductsService } from "./products.service.js";

export function createProductsService(env: AppEnv): ProductsService {
  switch (env) {
    case "mock":
      return createMockProductsService();
    case "staging":
      return createStagingProductsService();
    case "production":
      return createProductionProductsService();
  }
}
