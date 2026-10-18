import type { RaceList, RaceResponse, StageRecoveryResponse } from "@carbadapt/contracts";

/** Races, their stages, and the recovery plan for a finished stage. */
export interface RacesService {
  listRaces(userId: string): Promise<RaceList>;
  getRace(userId: string, id: string): Promise<RaceResponse>;
  getStageRecovery(userId: string, stageId: string): Promise<StageRecoveryResponse>;
}
