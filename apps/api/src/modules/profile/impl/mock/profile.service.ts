import { iso } from "../../../../http/values.js";
import { presentPhysical, presentUser } from "../../../../http/present.js";
import type { ModuleDeps } from "../../../deps.js";
import type { ProfileService } from "../../profile.service.js";

export function createMockProfileService(deps: ModuleDeps): ProfileService {
  const { db } = deps;
  return {
    async getMe(userId) {
      const user = await db.user.findUniqueOrThrow({
        where: { id: userId },
        include: { physical: true, subscription: true },
      });
      return {
        user: presentUser(user),
        physical: presentPhysical(user.physical),
        subscription: user.subscription ? { status: user.subscription.status } : null,
      };
    },
    async getPhysical(userId) {
      const row = await db.physicalData.findUnique({ where: { userId } });
      return { physical: presentPhysical(row) };
    },
    async listConflicts(userId) {
      const rows = await db.physicalDataConflict.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
      });
      return {
        conflicts: rows.map((row) => ({
          id: row.id,
          field: row.field,
          manualValue: row.manualValue,
          syncedValue: row.syncedValue,
          provider: row.provider,
          resolvedWith: row.resolvedWith,
          resolvedAt: iso(row.resolvedAt),
        })),
      };
    },
  };
}
