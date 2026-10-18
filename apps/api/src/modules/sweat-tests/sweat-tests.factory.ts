import type { AppEnv } from "../../config/env.js";
import { createMockSweatTestsService } from "./impl/mock/sweat-tests.service.js";
import { createProductionSweatTestsService } from "./impl/production/sweat-tests.service.js";
import { createStagingSweatTestsService } from "./impl/staging/sweat-tests.service.js";
import type { SweatTestsService } from "./sweat-tests.service.js";

export function createSweatTestsService(env: AppEnv): SweatTestsService {
  switch (env) {
    case "mock":
      return createMockSweatTestsService();
    case "staging":
      return createStagingSweatTestsService();
    case "production":
      return createProductionSweatTestsService();
  }
}
