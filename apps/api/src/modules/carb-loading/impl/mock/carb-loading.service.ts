import { BreakfastNote } from "@carbadapt/contracts";
import { ENGINE_VERSION, raceBreakfast } from "@carbadapt/engine";
import { HttpError, HttpErrorCode } from "../../../../http/errors.js";
import { day, toNumber } from "../../../../http/values.js";
import type { ModuleDeps } from "../../../deps.js";
import type { CarbLoadingService } from "../../carb-loading.service.js";

function loadingDayKey(raw: string): "D_MINUS_2" | "D_MINUS_1" {
  const key = raw.toUpperCase().replace(/-/g, "_");
  if (key === "D_2" || key === "D_MINUS_2" || key === "DMINUS2") return "D_MINUS_2";
  if (key === "D_1" || key === "D_MINUS_1" || key === "DMINUS1") return "D_MINUS_1";
  throw new HttpError(HttpErrorCode.InvalidLoadingDay);
}

export function createMockCarbLoadingService(deps: ModuleDeps): CarbLoadingService {
  const { db } = deps;
  return {
    async getLoadingDay(userId, raceId, rawDay) {
      const race = await db.race.findFirst({ where: { id: raceId, userId } });
      if (!race) throw new HttpError(HttpErrorCode.RaceNotFound);
      const which = loadingDayKey(rawDay);
      const row = await db.carbLoadingDay.findFirst({
        where: { raceId, day: which, isRehearsal: false },
      });
      if (!row) throw new HttpError(HttpErrorCode.LoadingDayNotFound);
      return {
        loadingDay: {
          id: row.id,
          day: row.day,
          date: day(row.date),
          gPerKg: toNumber(row.gPerKg) ?? 0,
          targetCarbsG: row.targetCarbsG,
          meals: row.meals,
        },
      };
    },
    async getBreakfast(userId, raceId) {
      const race = await db.race.findFirst({ where: { id: raceId, userId } });
      if (!race) throw new HttpError(HttpErrorCode.RaceNotFound);
      const user = await db.user.findUniqueOrThrow({
        where: { id: userId },
        include: { physical: true },
      });
      const weight = toNumber(user.physical?.weightKg);
      if (weight == null) {
        throw new HttpError(HttpErrorCode.WeightRequired);
      }
      const breakfast = raceBreakfast(weight);
      return {
        engineVersion: ENGINE_VERSION,
        derived: true as const,
        earlyStart: breakfast.earlyStart,
        gPerKg: breakfast.gPerKg,
        carbsG: breakfast.carbsG,
        fluidMl: breakfast.fluidMl,
        isotonicMl: breakfast.isotonicMl,
        waterMl: breakfast.waterMl,
        sodiumMg: breakfast.sodiumMg,
        drinkSodiumMgPerL: breakfast.drinkSodiumMgPerL,
        note: BreakfastNote.Standard,
      };
    },
  };
}
