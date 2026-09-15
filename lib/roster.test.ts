import assert from "node:assert/strict";
import { test } from "node:test";
import { newCharacter } from "./character/new.ts";
import { CURRENT_SCHEMA_VERSION, migrate } from "./character/migrate.ts";
import { relativeTime } from "./relative-time.ts";
import { parseRosterSummary } from "./roster.ts";

const now = new Date("2026-09-14T12:00:00.000Z");
const ago = (seconds: number) => new Date(now.getTime() - seconds * 1000);

test("relative time picks the right unit on each side of a boundary", () => {
  assert.equal(relativeTime(now, now), "now");
  assert.equal(relativeTime(ago(45), now), "45 seconds ago");
  assert.equal(relativeTime(ago(120), now), "2 minutes ago");
  assert.equal(relativeTime(ago(5 * 3600), now), "5 hours ago");
  assert.equal(relativeTime(ago(26 * 3600), now), "yesterday");
  assert.equal(relativeTime(ago(6 * 86400), now), "6 days ago");
  assert.equal(relativeTime(ago(20 * 86400), now), "3 weeks ago");
  assert.equal(relativeTime(ago(90 * 86400), now), "3 months ago");
  assert.equal(relativeTime(ago(800 * 86400), now), "2 years ago");
});

test("relative time reads a future instant forwards", () => {
  assert.equal(relativeTime(ago(-600), now), "in 10 minutes");
});

test("relative time accepts the ISO string the database returns", () => {
  assert.equal(relativeTime("2026-09-14T11:58:00.000Z", now), "2 minutes ago");
});

test("a blank character is a document migrate accepts unchanged", () => {
  const blank = newCharacter();
  const stored: unknown = JSON.parse(JSON.stringify(blank));
  assert.deepEqual(migrate(stored), blank);
  assert.equal(blank.schema_version, CURRENT_SCHEMA_VERSION);
});

test("a blank character starts empty at the first creation step", () => {
  const blank = newCharacter();
  assert.equal(blank.name, "");
  assert.equal(blank.essence, "");
  assert.equal(blank.creationStep, 1);
  assert.deepEqual(blank.themes, []);
  assert.deepEqual(blank.loadout.tags, []);
  assert.deepEqual(blank.loadout.themeIds, []);
});

// roster_summary is null on every row written before its migration lands,
// which is every row today. That must render as no bars, not a crash.
test("parseRosterSummary reads a row from before the migration as empty", () => {
  assert.deepEqual(parseRosterSummary(null), { themes: [], statuses: 0 });
});

test("parseRosterSummary reads the verified shapes", () => {
  assert.deepEqual(parseRosterSummary({ themes: [], statuses: 0 }), { themes: [], statuses: 0 });
  assert.deepEqual(
    parseRosterSummary({ themes: [{ type: "mythos", nascent: false }], statuses: 2 }),
    { themes: [{ type: "mythos", nascent: false }], statuses: 2 },
  );
  assert.deepEqual(
    parseRosterSummary({ themes: [{ type: null, nascent: true }], statuses: 0 }),
    { themes: [{ type: null, nascent: true }], statuses: 0 },
  );
});

test("parseRosterSummary never throws on a malformed value", () => {
  for (const value of [undefined, "not json", 42, [], { themes: "nope" }, { themes: [1, null], statuses: -1 }]) {
    assert.doesNotThrow(() => parseRosterSummary(value));
  }
  assert.deepEqual(parseRosterSummary({ themes: "nope", statuses: "3" }), { themes: [], statuses: 0 });
  assert.deepEqual(parseRosterSummary({ themes: [1, null, { type: "noise" }] }), {
    themes: [{ type: "noise", nascent: false }],
    statuses: 0,
  });
});
