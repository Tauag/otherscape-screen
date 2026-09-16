import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT_SCHEMA_VERSION, migrate } from "../migrate.ts";
import { sample } from "./sample.ts";

test("a current-version document passes through unchanged", () => {
  const stored: unknown = JSON.parse(JSON.stringify(sample));
  assert.deepEqual(migrate(stored), sample);
});

test("a non-object is rejected", () => {
  for (const bad of [null, undefined, 7, "{}", [sample]]) {
    assert.throws(() => migrate(bad), /not an object/);
  }
});

test("a missing or non-numeric schema_version is rejected", () => {
  const withoutVersion: Record<string, unknown> = { ...sample };
  delete withoutVersion.schema_version;
  assert.throws(() => migrate(withoutVersion), /schema_version/);
  assert.throws(() => migrate({ ...sample, schema_version: "1" }), /schema_version/);
  assert.throws(() => migrate({ ...sample, schema_version: 1.5 }), /schema_version/);
});

test("a document newer than this client is rejected, and the error names the version", () => {
  const future = CURRENT_SCHEMA_VERSION + 1;
  assert.throws(() => migrate({ ...sample, schema_version: future }), new RegExp(String(future)));
});

test("v1 -> v2 starts essenceChosen false, even with an essence already set", () => {
  const withEssence: Record<string, unknown> = { ...sample, schema_version: 1 };
  delete withEssence.essenceChosen;
  assert.deepEqual(migrate(withEssence), { ...sample, essenceChosen: false });

  const blank: Record<string, unknown> = { ...sample, schema_version: 1, essence: "" };
  delete blank.essenceChosen;
  assert.deepEqual(migrate(blank), { ...sample, essence: "", essenceChosen: false });
});
