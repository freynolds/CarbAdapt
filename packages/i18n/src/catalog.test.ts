import assert from "node:assert/strict";
import test from "node:test";
import { LOCALES, MESSAGE_IDS, TRANSLATION_STATUS, translate } from "./index.js";

test("every locale has a non-empty string for every id", () => {
  for (const id of MESSAGE_IDS) {
    for (const locale of LOCALES) {
      const text = translate(locale, id);
      assert.equal(typeof text, "string");
      assert.ok(text.length > 0, `${locale} ${id}`);
    }
  }
});

test("spanish and portuguese are marked as drafts", () => {
  assert.equal(TRANSLATION_STATUS.en, "source");
  assert.equal(TRANSLATION_STATUS.es, "draft");
  assert.equal(TRANSLATION_STATUS.pt, "draft");
});

test("interpolation replaces every placeholder", () => {
  assert.equal(
    translate("en", "home.level", { current: 2, total: 7 }),
    "Gut training · level 2 of 7",
  );
});
