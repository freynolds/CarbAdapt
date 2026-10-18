import type { AppEnv } from "../../config/env.js";
import type { ModuleDeps } from "../deps.js";
import { createMockProductsService } from "./impl/mock/products.service.js";
import { createProductionProductsService } from "./impl/production/products.service.js";
import { createStagingProductsService } from "./impl/staging/products.service.js";
import type { ProductsService } from "./products.service.js";

export function createProductsService(env: AppEnv, deps: ModuleDeps): ProductsService {
  switch (env) {
    case "mock":
      return createMockProductsService(deps);
    case "staging":
      return createStagingProductsService();
    case "production":
      return createProductionProductsService();
  }
}
