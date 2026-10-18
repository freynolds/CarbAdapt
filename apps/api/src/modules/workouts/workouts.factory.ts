import type { AppEnv } from "../../config/env.js";
import { createMockWorkoutsService } from "./impl/mock/workouts.service.js";
import { createProductionWorkoutsService } from "./impl/production/workouts.service.js";
import { createStagingWorkoutsService } from "./impl/staging/workouts.service.js";
import type { WorkoutsService } from "./workouts.service.js";

export function createWorkoutsService(env: AppEnv): WorkoutsService {
  switch (env) {
    case "mock":
      return createMockWorkoutsService();
    case "staging":
      return createStagingWorkoutsService();
    case "production":
      return createProductionWorkoutsService();
  }
}
