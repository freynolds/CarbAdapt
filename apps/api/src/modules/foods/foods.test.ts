import assert from "node:assert/strict";
import test from "node:test";
import { withApp } from "../../test/harness.js";

test("GET /foods searches the shared USDA list", async () => {
  await withApp(async ({ baseUrl, db }) => {
    const fdcId = 8_000_000 + Math.floor(Math.random() * 100_000);
    const name = `Test rice ${fdcId}`;
    await db.foodItem.create({
      data: {
        fdcId,
        name,
        category: "Test",
        carbsPer100g: 28.17,
        proteinPer100g: 2.69,
        fatPer100g: 0.28,
        fiberPer100g: 0.4,
        sodiumMgPer100g: 1,
        portionG: 158,
        portionLabel: "1 cup",
        fodmap: "LOW",
      },
    });
    try {
      const response = await fetch(`${baseUrl}/foods?query=${encodeURIComponent(name)}`);
      assert.equal(response.status, 200);
      const body = (await response.json()) as {
        foods: Array<{ fdcId: number; carbsPer100g: number; fodmap: string; portionLabel: string }>;
      };
      assert.equal(body.foods.length, 1);
      assert.equal(body.foods[0]?.fdcId, fdcId);
      assert.equal(body.foods[0]?.carbsPer100g, 28.17);
      assert.equal(body.foods[0]?.fodmap, "LOW");
      assert.equal(body.foods[0]?.portionLabel, "1 cup");
    } finally {
      await db.foodItem.deleteMany({ where: { fdcId } });
    }
  });
});
