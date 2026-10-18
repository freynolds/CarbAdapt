import { createHash, randomBytes } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { prisma, type Prisma } from "@carbadapt/db";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export type AuthedRequest = Request & { userId: string };

export function asyncRoute(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next);
  };
}

export function num(value: { toNumber(): number } | number | null | undefined): number | null {
  if (value == null) return null;
  return typeof value === "number" ? value : value.toNumber();
}

export function iso(value: Date | null | undefined): string | null {
  return value ? value.toISOString() : null;
}

export function day(value: Date | null | undefined): string | null {
  return value ? value.toISOString().slice(0, 10) : null;
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function newToken(): string {
  return randomBytes(32).toString("hex");
}

export async function attachUser(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.header("authorization");
    const bearer = header?.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : undefined;
    const cookie = readCookie(req.header("cookie"), "carbadapt_session");
    const token = bearer || cookie;
    if (!token) throw new HttpError(401, "Sign in as a demo athlete first.");
    const session = await prisma.session.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { user: true },
    });
    if (!session || session.expiresAt.getTime() < Date.now() || session.user.deletedAt) {
      throw new HttpError(401, "Session expired.");
    }
    (req as AuthedRequest).userId = session.userId;
    next();
  } catch (error) {
    next(error);
  }
}

export function readCookie(header: string | undefined, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

export function sessionCookie(token: string): string {
  return `carbadapt_session=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=1209600`;
}

export function containsId(value: Prisma.JsonValue, id: string): boolean {
  return JSON.stringify(value).includes(`"${id}"`);
}

export function replaceId(value: Prisma.JsonValue, id: string, replacement: string): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value).split(`"${id}"`).join(`"${replacement}"`)) as Prisma.InputJsonValue;
}

export const ATHLETES = ["ana", "bruno", "carla", "eli", "dani"] as const;
export type AthleteKey = (typeof ATHLETES)[number];

export function athleteEmail(key: string): string {
  return `${key}@demo.carbadapt.test`;
}
