import { HttpError, HttpErrorCode } from "../../../../http/errors.js";
import { presentRace, presentRecovery, raceInclude } from "../../../../http/present.js";
import type { ModuleDeps } from "../../../deps.js";
import type { RacesService } from "../../races.service.js";

export function createMockRacesService(deps: ModuleDeps): RacesService {
  const { db } = deps;
  return {
    async listRaces(userId) {
      const rows = await db.race.findMany({
        where: { userId },
        include: raceInclude,
        orderBy: { date: "asc" },
      });
      return { races: rows.map(presentRace) };
    },
    async getRace(userId, id) {
      const row = await db.race.findFirst({ where: { id, userId }, include: raceInclude });
      if (!row) throw new HttpError(HttpErrorCode.RaceNotFound);
      return { race: presentRace(row) };
    },
    async getStageRecovery(userId, stageId) {
      const stage = await db.stage.findFirst({
        where: { id: stageId, race: { userId } },
        include: { recovery: true },
      });
      if (!stage) throw new HttpError(HttpErrorCode.StageNotFound);
      return { recovery: stage.recovery ? presentRecovery(stage.recovery) : null };
    },
  };
}
