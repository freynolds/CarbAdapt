import type { AppEnv } from "../../config/env.js";
import { createMockConnectionsService } from "./impl/mock/connections.service.js";
import { createProductionConnectionsService } from "./impl/production/connections.service.js";
import { createStagingConnectionsService } from "./impl/staging/connections.service.js";
import type { ConnectionsService } from "./connections.service.js";

export function createConnectionsService(env: AppEnv): ConnectionsService {
  switch (env) {
    case "mock":
      return createMockConnectionsService();
    case "staging":
      return createStagingConnectionsService();
    case "production":
      return createProductionConnectionsService();
  }
}
