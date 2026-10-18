import type { AppEnv } from "../../config/env.js";
import type { ModuleDeps } from "../deps.js";
import { createMockRacesService } from "./impl/mock/races.service.js";
import { createProductionRacesService } from "./impl/production/races.service.js";
import { createStagingRacesService } from "./impl/staging/races.service.js";
import type { RacesService } from "./races.service.js";

export function createRacesService(env: AppEnv, deps: ModuleDeps): RacesService {
  switch (env) {
    case "mock":
      return createMockRacesService(deps);
    case "staging":
      return createStagingRacesService();
    case "production":
      return createProductionRacesService();
  }
}
