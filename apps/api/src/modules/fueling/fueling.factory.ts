import type { AppEnv } from "../../config/env.js";
import type { ModuleDeps } from "../deps.js";
import { createMockFuelingService } from "./impl/mock/fueling.service.js";
import { createProductionFuelingService } from "./impl/production/fueling.service.js";
import { createStagingFuelingService } from "./impl/staging/fueling.service.js";
import type { FuelingService } from "./fueling.service.js";

export function createFuelingService(env: AppEnv, deps: ModuleDeps): FuelingService {
  switch (env) {
    case "mock":
      return createMockFuelingService(deps);
    case "staging":
      return createStagingFuelingService();
    case "production":
      return createProductionFuelingService();
  }
}
