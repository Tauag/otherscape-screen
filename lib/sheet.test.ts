import assert from "node:assert/strict";
import { test } from "node:test";
import { sample } from "./character/__tests__/sample.ts";
import { themeCountWarning } from "./rules/readiness.ts";

test("the theme count warns only past the starting four", () => {
  assert.equal(themeCountWarning(sample.themes.length), null);
  assert.equal(themeCountWarning(0), null);
  assert.equal(
    themeCountWarning(5),
    "The character has 5 themes, more than the 4 it starts with.",
  );
});
