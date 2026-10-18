import type { ConnectionList } from "@carbadapt/contracts";

/** TrainingPeaks, Strava, and Garmin connection status. Tokens are never returned. */
export interface ConnectionsService {
  listConnections(userId: string): Promise<ConnectionList>;
}
