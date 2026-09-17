import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { resolve, scheduler, type LocalEntry } from "./autosave.ts";
import { newCharacter } from "./new.ts";

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
	assert.equal(resolve(entry(4, true), 4), "local", "the offline edit");
	assert.equal(
		resolve(entry(5, true), 4),
		"local",
		"a stale read of the server",
	);
	assert.equal(resolve(entry(2, true), 4), "conflict", "both sides hold edits");
});
