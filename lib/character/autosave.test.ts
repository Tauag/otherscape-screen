import assert from "node:assert/strict";
import { mock, test } from "node:test";
import {
	createAutosave,
	type LocalEntry,
	resolve,
	scheduler,
} from "./autosave.ts";
import { migrate } from "./migrate.ts";
import { newCharacter } from "./new.ts";
import type { Character } from "./types.ts";

test("the scheduler coalesces rapid calls into one run", () => {
	mock.timers.enable({ apis: ["setTimeout"] });
	let runs = 0;
	const save = scheduler(() => runs++, 800);

	save.schedule();
	mock.timers.tick(700);
	save.schedule();
	mock.timers.tick(700);
	save.schedule();

	assert.equal(runs, 0, "a call inside the window pushes the run out");
	mock.timers.tick(800);
	assert.equal(runs, 1);

	mock.timers.tick(5000);
	assert.equal(runs, 1, "the run does not repeat on its own");
	mock.timers.reset();
});

test("a flush runs the pending call now and leaves no timer behind", () => {
	mock.timers.enable({ apis: ["setTimeout"] });
	let runs = 0;
	const save = scheduler(() => runs++, 800);

	save.schedule();
	save.flush();
	assert.equal(runs, 1, "flush does not wait out the delay");

	mock.timers.tick(5000);
	assert.equal(runs, 1, "flush cancelled the timer instead of running twice");
	mock.timers.reset();
});

test("a flush with nothing pending does nothing", () => {
	mock.timers.enable({ apis: ["setTimeout"] });
	let runs = 0;
	const save = scheduler(() => runs++, 800);

	save.flush();
	save.schedule();
	mock.timers.tick(800);
	save.flush();

	assert.equal(runs, 1);
	mock.timers.reset();
});

test("a cancel drops the pending run", () => {
	mock.timers.enable({ apis: ["setTimeout"] });
	let runs = 0;
	const save = scheduler(() => runs++, 800);

	save.schedule();
	save.cancel();
	mock.timers.tick(5000);

	assert.equal(runs, 0);
	mock.timers.reset();
});

const entry = (version: number, dirty: boolean): LocalEntry => ({
	version,
	dirty,
	savedAt: "2026-09-14T12:00:00.000Z",
	document: newCharacter(),
});

test("the local copy wins only when it holds edits the server never saw", () => {
	assert.equal(resolve(null, 4), "remote", "nothing stored");
	assert.equal(
		resolve(entry(4, false), 4),
		"remote",
		"stored but already saved",
	);
	assert.equal(
		resolve(entry(2, false), 4),
		"remote",
		"stored, saved, and stale",
	);
	assert.equal(
		resolve(entry(5, false), 4),
		"local",
		"saved, but the server read is older (a cached page)",
	);
	assert.equal(resolve(entry(4, true), 4), "local", "the offline edit");
	assert.equal(
		resolve(entry(5, true), 4),
		"local",
		"a stale read of the server",
	);
	assert.equal(resolve(entry(2, true), 4), "conflict", "both sides hold edits");
});

// --- createAutosave: the localStorage trust boundary ------------------------

/** A localStorage stand-in. `fail` makes every call throw, as private mode and
 *  a full quota both do. */
function fakeStorage(fail = false) {
	const items = new Map<string, string>();
	globalThis.localStorage = {
		getItem(key: string) {
			if (fail) throw new Error("site data blocked");
			return items.get(key) ?? null;
		},
		setItem(key: string, value: string) {
			if (fail) throw new Error("site data blocked");
			items.set(key, value);
		},
	} as unknown as Storage;
	return items;
}

const store = () => createAutosave<Character>("otherscape:character", migrate);

test("a written entry reads back whole, under the prefixed key", () => {
	const items = fakeStorage();
	const auto = store();
	const written = entry(4, true);

	auto.writeLocal("abc", written);
	assert.deepEqual([...items.keys()], ["otherscape:character:abc"]);
	assert.deepEqual(auto.readLocal("abc"), written);
	assert.equal(auto.readLocal("other-id"), null, "keys don't collide");
});

test("an unreadable entry reads as no entry, never as a throw", () => {
	const items = fakeStorage();
	const auto = store();
	const key = auto.localKey("abc");

	for (const raw of [
		"not json",
		"null",
		"7",
		JSON.stringify({ version: "4", dirty: true, document: newCharacter() }),
		JSON.stringify({ version: 4, dirty: "yes", document: newCharacter() }),
	]) {
		items.set(key, raw);
		assert.equal(auto.readLocal("abc"), null, raw);
	}
});

// The entry is a trust boundary: migrate throws on a document it can't read,
// and that must not escape into the provider's mount.
test("an entry whose document migrate rejects reads as no entry", () => {
	const items = fakeStorage();
	const auto = store();
	items.set(
		auto.localKey("abc"),
		JSON.stringify({
			version: 4,
			dirty: true,
			savedAt: "x",
			document: { a: 1 },
		}),
	);
	assert.equal(auto.readLocal("abc"), null);
});

test("a missing savedAt reads as the epoch, so the conflict prompt still has a date", () => {
	const items = fakeStorage();
	const auto = store();
	items.set(
		auto.localKey("abc"),
		JSON.stringify({ version: 4, dirty: true, document: newCharacter() }),
	);
	assert.equal(auto.readLocal("abc")?.savedAt, new Date(0).toISOString());
});

test("a parked copy gets its own key, so a second conflict never overwrites the first", () => {
	fakeStorage();
	const auto = store();

	const first = auto.parkLocal("abc", entry(4, true));
	const second = auto.parkLocal("abc", entry(5, true));

	assert.ok(first?.startsWith(auto.parkedKeyPrefix("abc")));
	assert.ok(second?.startsWith(auto.parkedKeyPrefix("abc")));
	assert.notEqual(first, second);
});

// Losing the offline copy must not break the screen: the server save is the record.
test("a storage that throws writes nothing and reads as no entry", () => {
	fakeStorage(true);
	const auto = store();

	assert.equal(auto.readLocal("abc"), null);
	assert.doesNotThrow(() => auto.writeLocal("abc", entry(4, true)));
	assert.equal(auto.parkLocal("abc", entry(4, true)), null, "no key to name");
});
