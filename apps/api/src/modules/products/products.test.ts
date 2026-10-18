import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer, type Server } from "node:http";
import test from "node:test";
import { createApp } from "../../app.js";
import { readConfig } from "../../config/env.js";

async function withServer(
  app: ReturnType<typeof createApp>,
  run: (baseUrl: string) => Promise<void>,
): Promise<void> {
  const server: Server = createServer(app);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  if (address === null || typeof address === "string") {
    throw new Error("expected a TCP address");
  }
  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    server.close();
    await once(server, "close");
  }
}

test("GET /products returns the mock list", async () => {
  const app = createApp(readConfig({ APP_ENV: "mock" }));
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/products`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      products: [
        {
          id: "prod_mock_drink",
          type: "DRINK_MIX",
          name: "Example drink mix",
          brand: "Example",
          carbsG: 80,
          favorite: true,
        },
        {
          id: "prod_mock_gel",
          type: "GEL",
          name: "Example gel",
          brand: "Example",
          carbsG: 25,
          favorite: false,
        },
      ],
    });
  });
});

test("GET /health stays up in mock mode", async () => {
  const app = createApp(readConfig({ APP_ENV: "mock" }));
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: "ok" });
  });
});

test("staging and production are not implemented", () => {
  assert.throws(() => createApp(readConfig({ APP_ENV: "staging" })), /not implemented/);
  assert.throws(() => createApp(readConfig({ APP_ENV: "production" })), /not implemented/);
});
