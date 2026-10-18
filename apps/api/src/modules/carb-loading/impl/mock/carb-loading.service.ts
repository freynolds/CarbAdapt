import { BreakfastNote, FIXTURE_ENGINE_VERSION } from "@carbadapt/contracts";
import { HttpError, HttpErrorCode } from "../../../../http/errors.js";
import { hourInZone } from "../../../../http/calendar.js";
import { day, toNumber } from "../../../../http/values.js";
import type { ModuleDeps } from "../../../deps.js";
import type { CarbLoadingService } from "../../carb-loading.service.js";

/**
 * Mock breakfast rule carried from the local mock phase.
 * A start before 08:00 in the athlete's zone uses 1.5 g/kg. Any other start uses 2 g/kg.
 * Fluid is 5 ml/kg, all of it the demo isotonic at 800 mg sodium per liter.
 * The M3 engine replaces this. Nothing is stored.
 */
const DRINK_SODIUM_MG_PER_L = 800;

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
      const early = race.startAt ? hourInZone(race.startAt, user.timezone) < 8 : false;
      const gPerKg = early ? 1.5 : 2;
      const carbsG = Math.round(gPerKg * weight);
      const fluidMl = Math.round(5 * weight);
      const sodiumMg = Math.round((DRINK_SODIUM_MG_PER_L * fluidMl) / 1000);
      return {
        engineVersion: FIXTURE_ENGINE_VERSION,
        derived: true as const,
        earlyStart: early,
        gPerKg,
        carbsG,
        fluidMl,
        isotonicMl: fluidMl,
        waterMl: 0 as const,
        sodiumMg,
        drinkSodiumMgPerL: DRINK_SODIUM_MG_PER_L,
        note: early
          ? BreakfastNote.Early
          : race.startAt
            ? BreakfastNote.Default
            : BreakfastNote.MissingStart,
      };
    },
  };
}
