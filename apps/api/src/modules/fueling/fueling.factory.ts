import type { AppEnv } from "../../config/env.js";
import { createMockFuelingService } from "./impl/mock/fueling.service.js";
import { createProductionFuelingService } from "./impl/production/fueling.service.js";
import { createStagingFuelingService } from "./impl/staging/fueling.service.js";
import type { FuelingService } from "./fueling.service.js";

export function createFuelingService(env: AppEnv): FuelingService {
  switch (env) {
    case "mock":
      return createMockFuelingService();
    case "staging":
      return createStagingFuelingService();
    case "production":
      return createProductionFuelingService();
  }
}
