import type { AppEnv } from "../../config/env.js";
import { createMockProfileService } from "./impl/mock/profile.service.js";
import { createProductionProfileService } from "./impl/production/profile.service.js";
import { createStagingProfileService } from "./impl/staging/profile.service.js";
import type { ProfileService } from "./profile.service.js";

export function createProfileService(env: AppEnv): ProfileService {
  switch (env) {
    case "mock":
      return createMockProfileService();
    case "staging":
      return createStagingProfileService();
    case "production":
      return createProductionProfileService();
  }
}
