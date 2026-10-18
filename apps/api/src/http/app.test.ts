import assert from "node:assert/strict";
import test from "node:test";
import { createApp } from "../app.js";
import { readConfig } from "../config/env.js";
import { createDevService } from "../modules/dev/dev.factory.js";
import { getJson, withApp } from "../test/harness.js";

test("GET /health stays up in mock mode", async () => {
  await withApp(async ({ baseUrl }) => {
    const { status, body } = await getJson(`${baseUrl}/health`);
    assert.equal(status, 200);
    assert.deepEqual(body, { status: "ok" });
  });
});

test("staging and production are not implemented", () => {
  assert.throws(() => createApp(readConfig({ APP_ENV: "staging" })), /not implemented/);
  assert.throws(() => createApp(readConfig({ APP_ENV: "production" })), /not implemented/);
  assert.throws(() => createDevService("staging", { db: null as never }), /not implemented/);
  assert.throws(() => createDevService("production", { db: null as never }), /not implemented/);
});

test("unknown routes return JSON 404", async () => {
  await withApp(async ({ baseUrl }) => {
    const missing = await getJson(`${baseUrl}/no-such-route`);
    assert.equal(missing.status, 404);
    assert.deepEqual(missing.body, { error: "not_found", message: "Not found." });
  });
});
