import { HttpError } from "../../../../http/errors.js";
import { containerInclude, presentContainer } from "../../../../http/present.js";
import type { ModuleDeps } from "../../../deps.js";
import type { GearService } from "../../gear.service.js";

export function createMockGearService(deps: ModuleDeps): GearService {
  const { db } = deps;
  return {
    async listContainers(userId) {
      const rows = await db.container.findMany({
        where: { userId },
        include: containerInclude,
        orderBy: { name: "asc" },
      });
      return { containers: rows.map(presentContainer) };
    },
    async getContainer(userId, id) {
      const row = await db.container.findFirst({
        where: { id, userId },
        include: containerInclude,
      });
      if (!row) throw new HttpError(404, "not_found", "Container not found.");
      return { container: presentContainer(row) };
    },
  };
}
