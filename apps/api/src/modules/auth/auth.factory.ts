import type { AppEnv } from "../../config/env.js";
import { createMockAuthService } from "./impl/mock/auth.service.js";
import { createProductionAuthService } from "./impl/production/auth.service.js";
import { createStagingAuthService } from "./impl/staging/auth.service.js";
import type { AuthService } from "./auth.service.js";

export function createAuthService(env: AppEnv): AuthService {
  switch (env) {
    case "mock":
      return createMockAuthService();
    case "staging":
      return createStagingAuthService();
    case "production":
      return createProductionAuthService();
  }
}
