import type { AppEnv } from "../../config/env.js";
import type { ModuleDeps } from "../deps.js";
import { createMockDevService } from "./impl/mock/dev.service.js";
import { createProductionDevService } from "./impl/production/dev.service.js";
import { createStagingDevService } from "./impl/staging/dev.service.js";
import type { DevService } from "./dev.service.js";

export function createDevService(env: AppEnv, deps: ModuleDeps): DevService {
  switch (env) {
    case "mock":
      return createMockDevService(deps);
    case "staging":
      return createStagingDevService();
    case "production":
      return createProductionDevService();
  }
}
