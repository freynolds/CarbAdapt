import { insertSeed } from "@carbadapt/db";
import { HttpError, HttpErrorCode } from "../../../../http/errors.js";
import { hashToken, newToken } from "../../../../http/session.js";
import { iso } from "../../../../http/values.js";
import { presentUser } from "../../../../http/present.js";
import type { ModuleDeps } from "../../../deps.js";
import type { DevService } from "../../dev.service.js";

const SESSION_MS = 14 * 24 * 60 * 60 * 1000;

export function createMockDevService(deps: ModuleDeps): DevService {
  const { db } = deps;
  return {
    async loginAs(athleteId) {
      const user = await db.user.findUnique({ where: { id: athleteId } });
      if (!user) throw new HttpError(HttpErrorCode.AthleteNotFound);
      if (user.deletedAt) {
        await db.user.update({ where: { id: user.id }, data: { deletedAt: null } });
        user.deletedAt = null;
      }
      const token = newToken();
      await db.session.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(token),
          expiresAt: new Date(Date.now() + SESSION_MS),
        },
      });
      return { token, user: presentUser(user) };
    },
    async listAthletes() {
      const users = await db.user.findMany({ orderBy: { email: "asc" } });
      return {
        athletes: users.map((user) => ({
          athleteId: user.id,
          email: user.email,
          name: user.name,
          mode: user.mode,
          timezone: user.timezone,
          deletedAt: iso(user.deletedAt),
        })),
      };
    },
    async reset() {
      const seededAt = new Date();
      await insertSeed(db, seededAt);
      return { ok: true as const, seededAt: seededAt.toISOString() };
    },
  };
}
