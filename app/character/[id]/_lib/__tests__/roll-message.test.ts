import assert from "node:assert/strict";
import { test } from "node:test";
import { cleanLines, outcome, rollMessage } from "../roll-message.ts";

test("outcome tiers break at 7 and 10", () => {
	assert.equal(outcome(6), "Miss");
	assert.equal(outcome(7), "Mixed hit");
	assert.equal(outcome(9), "Mixed hit");
	assert.equal(outcome(10), "Strong hit");
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
