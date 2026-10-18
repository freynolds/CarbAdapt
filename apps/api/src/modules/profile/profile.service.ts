import type { ConflictList, MeResponse, PhysicalResponse } from "@carbadapt/contracts";

/** The signed-in athlete: account, locale, theme, and physical data. */
export interface ProfileService {
  getMe(userId: string): Promise<MeResponse>;
  getPhysical(userId: string): Promise<PhysicalResponse>;
  listConflicts(userId: string): Promise<ConflictList>;
}
