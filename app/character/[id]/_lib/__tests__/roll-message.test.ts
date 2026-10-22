import assert from "node:assert/strict";
import { test } from "node:test";
import {
	cleanLines,
	diceMaidenArgs,
	outcome,
	requestBlock,
	requestMessage,
	rollMessage,
} from "../roll-message.ts";

test("outcome tiers break at 7 and 10", () => {
	assert.equal(outcome(6), "Miss");
	assert.equal(outcome(7), "Mixed hit");
	assert.equal(outcome(9), "Mixed hit");
	assert.equal(outcome(10), "Strong hit");
});

test("snake eyes always miss and boxcars always strong-hit", () => {
	assert.equal(outcome(12, [1, 1]), "Miss");
	assert.equal(outcome(0, [6, 6]), "Strong hit");
	assert.equal(outcome(9, [4, 5]), "Mixed hit");
});

test("cleanLines rejects anything off-shape", () => {
	assert.equal(cleanLines("nope"), null);
	assert.equal(cleanLines([{ label: "a", value: 1.5, counted: true }]), null);
	assert.equal(cleanLines([{ label: "a", value: 99, counted: true }]), null);
	assert.equal(cleanLines([{ label: 1, value: 1, counted: true }]), null);
	assert.deepEqual(cleanLines([{ label: "  ", value: -1, counted: false }]), [
		{ label: "Unnamed", value: -1, counted: false },
	]);
});

test("the post scores only counted lines and pings nobody", () => {
	const message = rollMessage(
		"Vex",
		[
			{ label: "@everyone *fast*", value: 1, counted: true },
			{ label: "Hurt-2", value: 2, counted: false },
			{ label: "Modifier", value: 1, counted: true },
		],
		[3, 4],
		false,
	);
	assert.deepEqual(message.allowed_mentions, { parse: [] });
	const [embed] = message.embeds;
	assert.equal(embed.title, "9 · Mixed hit");
	assert.match(embed.description, /\\\*fast\\\*/);
	assert.match(embed.description, /~~.*Hurt-2~~/);
});

test("the request block lists every line and marks the uncounted ones", () => {
	assert.equal(
		requestBlock(
			[
				{ label: "Sharp `eyes`", value: 2, counted: true },
				{ label: "Hurt-2", value: -2, counted: false },
			],
			true,
		),
		"```\nMitigation Roll\nTotal Power +2\n+2 Sharp 'eyes'\n−2 Hurt-2 (not counted)\n```",
	);
});

test("the Dice Maiden args are one line with the power as the modifier", () => {
	const lines = [
		{ label: "Sharp\neyes", value: 2, counted: true },
		{ label: "Hurt-2", value: -2, counted: false },
	];
	assert.equal(
		diceMaidenArgs(lines, false),
		"2d6+2 ! Power Roll: +2 Sharp eyes, −2 Hurt-2 (not counted)",
	);
	assert.match(
		diceMaidenArgs([{ ...lines[0], value: -1 }], true),
		/^2d6-1 ! Mitigation/,
	);
	assert.match(diceMaidenArgs([], false), /^2d6 ! /);
});

test("a request lists the tags and power but rolls no dice", () => {
	const message = requestMessage(
		"Kit",
		[
			{ label: "Sharp *eyes*", value: 2, counted: true },
			{ label: "Weak", value: -1, counted: false },
		],
		false,
	);
	const [embed] = message.embeds;
	assert.deepEqual(message.allowed_mentions, { parse: [] });
	assert.equal(embed.title, "Requests a roll");
	assert.equal(
		embed.description,
		"Power **+2**\n`+2` Sharp \\*eyes\\*\n~~`−1` Weak~~",
	);
});
