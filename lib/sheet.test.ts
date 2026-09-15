import assert from "node:assert/strict";
import { test } from "node:test";
import { sample } from "./character/__tests__/sample.ts";
import { themeCountWarning } from "./rules/readiness.ts";
import { tagLabel } from "./tag-label.ts";

test("a tag label names the question, and a weakness letter wears its w", () => {
  const theme = sample.themes[0];
  assert.deepEqual(
    theme.powerTags.map((tag) => tagLabel(tag, "power")),
    ["A", "C", "C"],
  );
  assert.deepEqual(
    theme.weaknessTags.map((tag) => tagLabel(tag, "weakness")),
    ["wB"],
  );
});

test("the theme count warns only past the starting four", () => {
  assert.equal(themeCountWarning(sample.themes.length), null);
  assert.equal(themeCountWarning(0), null);
  assert.equal(
    themeCountWarning(5),
    "The character has 5 themes, more than the 4 it starts with.",
  );
});
