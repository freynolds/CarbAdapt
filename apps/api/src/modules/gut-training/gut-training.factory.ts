import type { AppEnv } from "../../config/env.js";
import type { ModuleDeps } from "../deps.js";
import { createMockGutTrainingService } from "./impl/mock/gut-training.service.js";
import { createProductionGutTrainingService } from "./impl/production/gut-training.service.js";
import { createStagingGutTrainingService } from "./impl/staging/gut-training.service.js";
import type { GutTrainingService } from "./gut-training.service.js";

export function createGutTrainingService(env: AppEnv, deps: ModuleDeps): GutTrainingService {
  switch (env) {
    case "mock":
      return createMockGutTrainingService(deps);
    case "staging":
      return createStagingGutTrainingService();
    case "production":
      return createProductionGutTrainingService();
  }
}
