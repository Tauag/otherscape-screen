import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import {
	answerIndex,
	artPath,
	askOracle,
	BACK_ART,
	drawCards,
	MAJOR_ARCANA,
} from "../oracle.ts";

/** Replays the given [0, 1) values in order. */
const replay =
	(...values: number[]) =>
	() =>
		values.shift() ?? 0;

test("each face maps to its answer", () => {
	assert.deepEqual([1, 2, 3, 4, 5, 6].map(answerIndex), [0, 1, 1, 2, 2, 3]);
});

test("odds pick which die to keep", () => {
	// 0.2 -> 2, 0.9 -> 6
	assert.deepEqual(askOracle("even", replay(0.2)), { dice: [2], kept: 2 });
	assert.equal(askOracle("lean yes", replay(0.2, 0.9)).kept, 6);
	assert.equal(askOracle("lean no", replay(0.2, 0.9)).kept, 2);
});

test("a spread never repeats a card, even when the source repeats", () => {
	for (const count of [1, 2, 3]) {
		const drawn = drawCards(count, replay(0, 0, 0, 0, 0, 0));
		assert.equal(drawn.length, count);
		assert.equal(new Set(drawn.map((d) => d.card.number)).size, count);
	}
	// The last value just under 1 must still land inside the deck.
	const [last] = drawCards(1, replay(0.9999, 0.9999));
	assert.equal(last.card.number, 21);
	assert.equal(last.reversed, false);
});

test("the deck is the 22 major arcana in order", () => {
	assert.deepEqual(
		MAJOR_ARCANA.map((card) => card.number),
		[...Array(22).keys()],
	);
});

test("every card's art file exists", () => {
	for (const card of MAJOR_ARCANA) {
		assert.ok(existsSync(`public${artPath(card)}`), artPath(card));
	}
	assert.ok(existsSync(`public${BACK_ART}`));
});
