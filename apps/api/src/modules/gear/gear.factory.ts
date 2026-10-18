import type { AppEnv } from "../../config/env.js";
import { createMockGearService } from "./impl/mock/gear.service.js";
import { createProductionGearService } from "./impl/production/gear.service.js";
import { createStagingGearService } from "./impl/staging/gear.service.js";
import type { GearService } from "./gear.service.js";

export function createGearService(env: AppEnv): GearService {
  switch (env) {
    case "mock":
      return createMockGearService();
    case "staging":
      return createStagingGearService();
    case "production":
      return createProductionGearService();
  }
}
