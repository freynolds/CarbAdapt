import { HttpError } from "../../../../http/errors.js";
import { presentSweat } from "../../../../http/present.js";
import type { ModuleDeps } from "../../../deps.js";
import type { SweatTestsService } from "../../sweat-tests.service.js";

export function createMockSweatTestsService(deps: ModuleDeps): SweatTestsService {
  const { db } = deps;
  return {
    async listSweatTests(userId) {
      const rows = await db.sweatTest.findMany({
        where: { userId },
        orderBy: { scheduledFor: "asc" },
      });
      return { sweatTests: rows.map(presentSweat) };
    },
    async getSweatTest(userId, id) {
      const row = await db.sweatTest.findFirst({ where: { id, userId } });
      if (!row) throw new HttpError(404, "not_found", "Sweat test not found.");
      return { sweatTest: presentSweat(row) };
    },
  };
}
