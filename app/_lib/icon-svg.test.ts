import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { iconSvg } from "./icon-svg.ts";

test("icon-svg.ts matches app/icon.svg", () => {
	assert.equal(iconSvg, readFileSync("app/icon.svg", "utf8"));
});
