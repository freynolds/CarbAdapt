import type { AppEnv } from "../../config/env.js";
import type { GearService } from "../gear/gear.service.js";
import type { ProductsService } from "../products/products.service.js";
import type { ProfileService } from "../profile/profile.service.js";
import type { RacesService } from "../races/races.service.js";
import type { SweatTestsService } from "../sweat-tests/sweat-tests.service.js";
import type { TodosService } from "../todos/todos.service.js";
import type { WorkoutsService } from "../workouts/workouts.service.js";
import { createMockHomeService } from "./impl/mock/home.service.js";
import { createProductionHomeService } from "./impl/production/home.service.js";
import { createStagingHomeService } from "./impl/staging/home.service.js";
import type { HomeService } from "./home.service.js";

export type HomeDeps = {
  profile: ProfileService;
  workouts: WorkoutsService;
  sweatTests: SweatTestsService;
  todos: TodosService;
  products: ProductsService;
  gear: GearService;
  races: RacesService;
};

export function createHomeService(env: AppEnv, deps: HomeDeps): HomeService {
  switch (env) {
    case "mock":
      return createMockHomeService(deps);
    case "staging":
      return createStagingHomeService();
    case "production":
      return createProductionHomeService();
  }
}
