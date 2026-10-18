import type { AppEnv } from "../../config/env.js";
import type { ModuleDeps } from "../deps.js";
import { createMockProfileService } from "./impl/mock/profile.service.js";
import { createProductionProfileService } from "./impl/production/profile.service.js";
import { createStagingProfileService } from "./impl/staging/profile.service.js";
import type { ProfileService } from "./profile.service.js";

export function createProfileService(env: AppEnv, deps: ModuleDeps): ProfileService {
  switch (env) {
    case "mock":
      return createMockProfileService(deps);
    case "staging":
      return createStagingProfileService();
    case "production":
      return createProductionProfileService();
  }
}
