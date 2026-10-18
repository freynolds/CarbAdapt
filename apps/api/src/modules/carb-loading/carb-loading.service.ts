import type { BreakfastResponse, LoadingDayResponse } from "@carbadapt/contracts";

/** Stored loading days, plus the mock breakfast derivation for a race start. */
export interface CarbLoadingService {
  getLoadingDay(userId: string, raceId: string, day: string): Promise<LoadingDayResponse>;
  getBreakfast(userId: string, raceId: string): Promise<BreakfastResponse>;
}
