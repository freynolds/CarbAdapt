import type { ConflictList, MeResponse, PhysicalResponse } from "@carbadapt/contracts";
import type { z } from "zod";
import type { patchMeSchema, patchPhysicalSchema, resolveConflictSchema } from "../../domain/schemas.js";

/** The signed-in athlete: account, locale, theme, and physical data. */
export interface ProfileService {
  getMe(userId: string): Promise<MeResponse>;
  getPhysical(userId: string): Promise<PhysicalResponse>;
  listConflicts(userId: string): Promise<ConflictList>;
  patchMe(userId: string, body: z.infer<typeof patchMeSchema>): Promise<MeResponse>;
  deleteMe(userId: string): Promise<{ deleted: true }>;
  patchPhysical(userId: string, body: z.infer<typeof patchPhysicalSchema>): Promise<PhysicalResponse>;
  resolveConflict(
    userId: string,
    id: string,
    body: z.infer<typeof resolveConflictSchema>,
  ): Promise<{ resolved: true }>;
}
