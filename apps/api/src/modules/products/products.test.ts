import assert from "node:assert/strict";
import test from "node:test";
import { testId, withAthlete } from "../../test/harness.js";

test("GET /products returns only the signed-in athlete's library", async () => {
  await withAthlete(async ({ baseUrl, db, userId, cookie }) => {
    const otherId = testId("usr");
    await db.user.create({
      data: { id: otherId, email: `${otherId}@test.carbadapt`, timezone: "UTC" },
    });
    try {
      await db.product.create({
        data: {
          id: testId("prd"),
          userId,
          type: "GEL",
          name: "Visible gel",
          brand: "Demo",
          carbsG: 22,
          sodiumMg: 40,
          favorite: true,
        },
      });
      await db.product.create({
        data: {
          id: testId("prd"),
          userId: otherId,
          type: "GEL",
          name: "Hidden gel",
          carbsG: 99,
        },
      });
      await db.product.create({
        data: {
          id: testId("prd"),
          userId,
          type: "DRINK_MIX",
          name: "Deleted mix",
          carbsG: 80,
          deletedAt: new Date(),
        },
      });

      const response = await fetch(`${baseUrl}/products`, { headers: { cookie } });
      assert.equal(response.status, 200);
      const body = (await response.json()) as {
        products: Array<{ name: string; carbsG: number; brand: string | null; favorite: boolean }>;
      };
      assert.equal(body.products.length, 1);
      assert.equal(body.products[0]?.name, "Visible gel");
      assert.equal(body.products[0]?.carbsG, 22);
      assert.equal(body.products[0]?.brand, "Demo");
      assert.equal(body.products[0]?.favorite, true);

      const id = (await db.product.findFirstOrThrow({ where: { userId, name: "Visible gel" } })).id;
      const one = await fetch(`${baseUrl}/products/${id}`, { headers: { cookie } });
      assert.equal(one.status, 200);
    } finally {
      await db.user.delete({ where: { id: otherId } }).catch(() => undefined);
    }
  });
});

test("GET /products requires a session", async () => {
  await withAthlete(async ({ baseUrl }) => {
    const response = await fetch(`${baseUrl}/products`);
    assert.equal(response.status, 401);
  });
});
