import type { AppEnv } from "../../config/env.js";
import type { ModuleDeps } from "../deps.js";
import { createMockCarbLoadingService } from "./impl/mock/carb-loading.service.js";
import { createProductionCarbLoadingService } from "./impl/production/carb-loading.service.js";
import { createStagingCarbLoadingService } from "./impl/staging/carb-loading.service.js";
import type { CarbLoadingService } from "./carb-loading.service.js";

export function createCarbLoadingService(env: AppEnv, deps: ModuleDeps): CarbLoadingService {
  switch (env) {
    case "mock":
      return createMockCarbLoadingService(deps);
    case "staging":
      return createStagingCarbLoadingService();
    case "production":
      return createProductionCarbLoadingService();
  }
}
