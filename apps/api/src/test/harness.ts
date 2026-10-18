import assert from "node:assert/strict";
import { once } from "node:events";
import { randomBytes } from "node:crypto";
import { createServer, type Server } from "node:http";
import type { PrismaClient } from "@carbadapt/db";
import { appDb, createApp } from "../app.js";
import { readConfig } from "../config/env.js";

export function testId(prefix: string): string {
  return `${prefix}_${randomBytes(4).toString("hex")}`;
}

export async function withApp(
  run: (ctx: { baseUrl: string; db: PrismaClient }) => Promise<void>,
): Promise<void> {
  const app = createApp(readConfig({ APP_ENV: "mock" }));
  const db = appDb(app);
  const server: Server = createServer(app);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  if (address === null || typeof address === "string") {
    throw new Error("expected a TCP address");
  }
  try {
    await run({ baseUrl: `http://127.0.0.1:${address.port}`, db });
  } finally {
    server.close();
    await once(server, "close");
    await db.$disconnect();
  }
}

export async function withAthlete(
  run: (ctx: {
    baseUrl: string;
    db: PrismaClient;
    userId: string;
    cookie: string;
    token: string;
  }) => Promise<void>,
): Promise<void> {
  await withApp(async ({ baseUrl, db }) => {
    const userId = testId("usr");
    await db.user.create({
      data: {
        id: userId,
        email: `${userId}@test.carbadapt`,
        name: "Test Athlete",
        timezone: "UTC",
        mode: "FUEL_MY_WORKOUTS",
      },
    });
    try {
      const login = await fetch(`${baseUrl}/dev/login-as`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ athleteId: userId }),
      });
      assert.equal(login.status, 200);
      const body = (await login.json()) as { token: string };
      const pair = login.headers
        .getSetCookie()
        .find((item) => item.startsWith("carbadapt_session="));
      assert.ok(pair, "session cookie missing");
      await run({
        baseUrl,
        db,
        userId,
        cookie: pair.split(";")[0] ?? "",
        token: body.token,
      });
    } finally {
      await db.user.delete({ where: { id: userId } }).catch(() => undefined);
    }
  });
}

export async function getJson(
  url: string,
  cookie?: string,
): Promise<{ status: number; body: unknown }> {
  const response = await fetch(url, { headers: cookie ? { cookie } : {} });
  return { status: response.status, body: await response.json() };
}
