import assert from "node:assert/strict";
import { test } from "node:test";
import type { PowerTag } from "../../character/types.ts";
import { DEFAULT_BURN_VALUE } from "../constants.ts";
import { burnValueOf, power, type RollSelection } from "../power.ts";

function selection(over: Partial<RollSelection> = {}): RollSelection {
	return { tags: [], statuses: [], modifier: 0, ...over };
}

test("a positive tag adds 1 and a negative tag subtracts 1", () => {
	const { lines, total } = power(
		selection({
			tags: [{ valence: "positive" }, { valence: "negative" }],
		}),
	);
	assert.deepEqual(lines, [
		{ value: 1, counted: true },
		{ value: -1, counted: true },
	]);
	assert.equal(total, 0);
});

test("only the highest tier each side counts, and the outranked status stays in the lines", () => {
	const { lines, total } = power(
		selection({
			statuses: [
				{ valence: "negative", tier: 1 },
				{ valence: "positive", tier: 2 },
				{ valence: "negative", tier: 3 },
			],
		}),
	);
	assert.deepEqual(lines, [
		{ value: -1, counted: false },
		{ value: 2, counted: true },
		{ value: -3, counted: true },
	]);
	assert.equal(total, -1);
});

test("a tie goes to the first status in input order", () => {
	const { lines, total } = power(
		selection({
			statuses: [
				{ valence: "positive", tier: 2 },
				{ valence: "positive", tier: 2 },
			],
		}),
	);
	assert.deepEqual(
		lines.map((line) => line.counted),
		[true, false],
	);
	assert.equal(total, 2);
});

test("a burn adds its own value, at 4 and at 5", () => {
	for (const value of [4, 5]) {
		const { total } = power(
			selection({
				tags: [{ valence: "positive", burnValue: value }],
			}),
		);
		assert.equal(total, value);
	}
});

test("a burn with no recorded value adds the default", () => {
	const tag: PowerTag = {
		id: "pt-1",
		themebook: "Esoterica",
		letter: "A",
		text: "lantern of the dead",
		burnt: true,
	};
	const { total } = power(
		selection({
			tags: [{ valence: "positive", burnValue: burnValueOf(tag) }],
		}),
	);
	assert.equal(total, DEFAULT_BURN_VALUE);
	assert.equal(burnValueOf({ ...tag, burnt: false }), null);
});

test("rolling with Self replaces the positive tags but keeps negatives and statuses", () => {
	const { lines, total } = power(
		selection({
			tags: [{ valence: "positive", burnValue: 5 }, { valence: "negative" }],
			statuses: [{ valence: "positive", tier: 2 }],
			rollWith: { type: "self", themeCount: 2 },
		}),
	);
	assert.deepEqual(lines, [
		{ value: 2, counted: true },
		{ value: 1, counted: false },
		{ value: -1, counted: true },
		{ value: 2, counted: true },
	]);
	assert.equal(total, 3);
});

test("the manual modifier is a line only when it is not 0", () => {
	assert.deepEqual(power(selection({ modifier: 0 })), { lines: [], total: 0 });
	assert.deepEqual(power(selection({ modifier: -2 })), {
		lines: [{ value: -2, counted: true }],
		total: -2,
	});
});
