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

// A v1 document predates the Loadout Set rewrite too, so it carries the old
// loadout shape - migrate walks it through both steps on the way to v3, and
// the loadout comes out reset regardless (see the v2 -> v3 test below).
const oldLoadout = {
  themeIds: ["th-chrome"],
  tags: [{ id: "lt-1", kind: "tag", text: "reflex booster", themeId: "th-chrome" }],
  specials: sample.loadout.specials,
  availablePower: sample.loadout.availablePower,
  upgrade: sample.loadout.upgrade,
};
const resetLoadout = {
  sets: [],
  wildcards: 0,
  specials: sample.loadout.specials,
  availablePower: sample.loadout.availablePower,
  upgrade: sample.loadout.upgrade,
};

test("v1 -> v2 starts essenceChosen false, even with an essence already set", () => {
  const withEssence: Record<string, unknown> = { ...sample, schema_version: 1, loadout: oldLoadout };
  delete withEssence.essenceChosen;
  assert.deepEqual(migrate(withEssence), { ...sample, essenceChosen: false, loadout: resetLoadout });

  const blank: Record<string, unknown> = {
    ...sample,
    schema_version: 1,
    essence: "",
    loadout: oldLoadout,
  };
  delete blank.essenceChosen;
  assert.deepEqual(migrate(blank), {
    ...sample,
    essence: "",
    essenceChosen: false,
    loadout: resetLoadout,
  });
});

test("v2 -> v3 resets the loadout to the new shape, keeping the budget fields", () => {
  const old: Record<string, unknown> = {
    ...sample,
    schema_version: 2,
    loadout: {
      themeIds: ["th-chrome"],
      tags: [{ id: "lt-1", kind: "tag", text: "reflex booster", themeId: "th-chrome" }],
      specials: ["An old loadout special."],
      availablePower: 3,
      upgrade: 2,
    },
  };

  assert.deepEqual(migrate(old), {
    ...sample,
    loadout: { sets: [], wildcards: 0, specials: ["An old loadout special."], availablePower: 3, upgrade: 2 },
  });
});
