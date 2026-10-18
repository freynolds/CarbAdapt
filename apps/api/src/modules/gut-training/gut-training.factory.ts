import type { AppEnv } from "../../config/env.js";
import { createMockGutTrainingService } from "./impl/mock/gut-training.service.js";
import { createProductionGutTrainingService } from "./impl/production/gut-training.service.js";
import { createStagingGutTrainingService } from "./impl/staging/gut-training.service.js";
import type { GutTrainingService } from "./gut-training.service.js";

export function createGutTrainingService(env: AppEnv): GutTrainingService {
  switch (env) {
    case "mock":
      return createMockGutTrainingService();
    case "staging":
      return createStagingGutTrainingService();
    case "production":
      return createProductionGutTrainingService();
  }
}
