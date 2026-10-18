import { CONNECTION_PROVIDER_ORDER, ConnectionStatus } from "@carbadapt/contracts";
import { iso } from "../../../../http/values.js";
import type { ModuleDeps } from "../../../deps.js";
import type { ConnectionsService } from "../../connections.service.js";

export function createMockConnectionsService(deps: ModuleDeps): ConnectionsService {
  return {
    async listConnections(userId) {
      const rows = await deps.db.providerConnection.findMany({ where: { userId } });
      return {
        connections: CONNECTION_PROVIDER_ORDER.map((provider) => {
          const row = rows.find((item) => item.provider === provider);
          if (!row) {
            return {
              provider,
              status: ConnectionStatus.Disconnected,
              externalUserId: null,
              lastSyncAt: null,
              scopes: null,
            };
          }
          return {
            provider,
            status: row.status,
            externalUserId: row.externalUserId,
            lastSyncAt: iso(row.lastSyncAt),
            scopes: row.scopes,
          };
        }),
      };
    },
  };
}
