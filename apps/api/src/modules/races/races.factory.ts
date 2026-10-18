import type { AppEnv } from "../../config/env.js";
import { createMockRacesService } from "./impl/mock/races.service.js";
import { createProductionRacesService } from "./impl/production/races.service.js";
import { createStagingRacesService } from "./impl/staging/races.service.js";
import type { RacesService } from "./races.service.js";

export function createRacesService(env: AppEnv): RacesService {
  switch (env) {
    case "mock":
      return createMockRacesService();
    case "staging":
      return createStagingRacesService();
    case "production":
      return createProductionRacesService();
  }
}
