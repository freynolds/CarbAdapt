import type { ConnectionsService } from "../../connections.service.js";

export function createMockConnectionsService(): ConnectionsService {
  return { module: "connections" };
}
