import assert from "node:assert/strict";
import test from "node:test";
import { HttpErrorCode, ServiceStatus, httpErrorBody } from "@carbadapt/contracts";
import { createApp } from "../app.js";
import { readConfig } from "../config/env.js";
import { HttpError } from "./errors.js";
import { createDevService } from "../modules/dev/dev.factory.js";
import { getJson, withApp } from "../test/harness.js";

function isNotImplemented(error: unknown): boolean {
  return error instanceof HttpError && error.code === HttpErrorCode.NotImplemented;
}

test("GET /health stays up in mock mode", async () => {
  await withApp(async ({ baseUrl }) => {
    const { status, body } = await getJson(`${baseUrl}/health`);
    assert.equal(status, 200);
    assert.deepEqual(body, { status: ServiceStatus.Ok });
  });
});

test("staging and production are not implemented", () => {
  assert.throws(() => createApp(readConfig({ APP_ENV: "staging" })), isNotImplemented);
  assert.throws(() => createApp(readConfig({ APP_ENV: "production" })), isNotImplemented);
  assert.throws(() => createDevService("staging", { db: null as never }), isNotImplemented);
  assert.throws(() => createDevService("production", { db: null as never }), isNotImplemented);
});

test("unknown routes return the shared not-found error", async () => {
  await withApp(async ({ baseUrl }) => {
    const missing = await getJson(`${baseUrl}/no-such-route`);
    assert.equal(missing.status, 404);
    assert.deepEqual(missing.body, httpErrorBody(HttpErrorCode.NotFound));
  });
});

test("invalid JSON and an invalid body use the shared error codes", async () => {
  await withApp(async ({ baseUrl }) => {
    const invalidJson = await fetch(`${baseUrl}/dev/login-as`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{",
    });
    assert.equal(invalidJson.status, 400);
    assert.deepEqual(await invalidJson.json(), httpErrorBody(HttpErrorCode.InvalidJson));

    const invalidBody = await fetch(`${baseUrl}/dev/login-as`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    assert.equal(invalidBody.status, 400);
    const body = (await invalidBody.json()) as { error: string; message: string; details: unknown };
    assert.equal(body.error, HttpErrorCode.InvalidRequest);
    assert.equal(body.message, httpErrorBody(HttpErrorCode.InvalidRequest).message);
    assert.ok(body.details);
  });
});
