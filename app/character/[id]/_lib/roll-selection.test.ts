import assert from "node:assert/strict";
import { test } from "node:test";
import {
	cancelMitigationPick,
	finalizeRollPick,
	NO_PICK,
	startMitigationPick,
} from "./roll-selection.ts";

test("a mitigation roll locks out exactly the tags the mitigated roll spent", () => {
	const afterAction = finalizeRollPick({ ...NO_PICK, ids: ["fire", "fear"] });
	assert.deepEqual(afterAction.lastRolledIds, ["fire", "fear"]);
	assert.deepEqual(afterAction.ids, []);

	const mitigating = startMitigationPick(afterAction);
	assert.deepEqual(mitigating.mitigationLockedIds, ["fire", "fear"]);
});

test("finishing the mitigation roll lifts the lock and remembers its own spend", () => {
	const mitigating = startMitigationPick(
		finalizeRollPick({ ...NO_PICK, ids: ["fire"] }),
	);
	const afterMitigation = finalizeRollPick({
		...mitigating,
		ids: ["grit"],
	});

	assert.deepEqual(afterMitigation.mitigationLockedIds, []);
	assert.deepEqual(afterMitigation.lastRolledIds, ["grit"]);
});

test("cancelling the mitigation lifts the lock without touching the pick", () => {
	const mitigating = startMitigationPick(
		finalizeRollPick({ ...NO_PICK, ids: ["fire"] }),
	);
	const cancelled = cancelMitigationPick({ ...mitigating, ids: ["grit"] });

	assert.deepEqual(cancelled.mitigationLockedIds, []);
	assert.deepEqual(cancelled.ids, ["grit"], "cancel doesn't discard the pick");
});
