import { createHash, randomBytes } from "node:crypto";
import type { PrismaClient } from "@carbadapt/db";
import type { Request, RequestHandler } from "express";
import { HttpError, HttpErrorCode } from "./errors.js";

export const SESSION_COOKIE = "carbadapt_session";
const SESSION_MAX_AGE_SECONDS = 14 * 24 * 60 * 60;

export type AuthedRequest = Request & { userId: string };

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function newToken(): string {
  return randomBytes(32).toString("hex");
}

export function sessionCookie(token: string): string {
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_MAX_AGE_SECONDS}`;
}

export function readCookie(header: string | undefined, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

export function readToken(req: Request): string | undefined {
  const header = req.header("authorization");
  const bearer = header?.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : undefined;
  const cookie = readCookie(req.header("cookie"), SESSION_COOKIE);
  return bearer || cookie;
}

export function userId(req: Request): string {
  const id = (req as AuthedRequest).userId;
  if (!id) {
    throw new HttpError(HttpErrorCode.Unauthorized);
  }
  return id;
}

export function requireUser(db: PrismaClient): RequestHandler {
  return (req, _res, next) => {
    const token = readToken(req);
    if (!token) {
      next(new HttpError(HttpErrorCode.Unauthorized));
      return;
    }
    db.session
      .findUnique({
        where: { tokenHash: hashToken(token) },
        include: { user: true },
      })
      .then((session) => {
        if (!session || session.expiresAt.getTime() < Date.now() || session.user.deletedAt) {
          next(new HttpError(HttpErrorCode.SessionExpired));
          return;
        }
        (req as AuthedRequest).userId = session.userId;
        next();
      })
      .catch(next);
  };
}

export function routeParam(value: string | string[] | undefined, name: string): string {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) {
    throw new HttpError(HttpErrorCode.MissingParameter, { name });
  }
  return raw;
}
