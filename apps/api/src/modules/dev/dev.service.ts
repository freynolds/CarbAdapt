import type { DevAthleteList, DevLoginResponse, DevResetResponse } from "@carbadapt/contracts";

/** Local demo sign-in. Mounted only when APP_ENV is mock. */
export interface DevService {
  loginAs(athleteId: string): Promise<DevLoginResponse>;
  listAthletes(): Promise<DevAthleteList>;
  reset(): Promise<DevResetResponse>;
}
