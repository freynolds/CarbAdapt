import type { AppEnv } from "../../config/env.js";
import type { ModuleDeps } from "../deps.js";
import { createMockTodosService } from "./impl/mock/todos.service.js";
import { createProductionTodosService } from "./impl/production/todos.service.js";
import { createStagingTodosService } from "./impl/staging/todos.service.js";
import type { TodosService } from "./todos.service.js";

export function createTodosService(env: AppEnv, deps: ModuleDeps): TodosService {
  switch (env) {
    case "mock":
      return createMockTodosService(deps);
    case "staging":
      return createStagingTodosService();
    case "production":
      return createProductionTodosService();
  }
}
