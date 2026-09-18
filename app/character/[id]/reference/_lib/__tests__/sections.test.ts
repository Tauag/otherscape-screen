import assert from "node:assert/strict";
import { test } from "node:test";
import { FALLBACK_PACK } from "@/lib/content/pack";
import { filter, type Section, sections } from "../sections.ts";

const all: Section[] = [
	{
		title: "Effects",
		rows: [
			{ name: "Attack", cost: "1 Power", text: "Inflict a status." },
			{ name: "Discover", cost: "", text: "" },
		],
	},
	{ title: "Scale", rows: [] },
];

test("the five cheatsheet sections come from the pack, in reading order", () => {
	assert.deepEqual(
		sections(FALLBACK_PACK.reference).map((section) => section.title),
		["Effects", "Mitigation", "Scale", "Power options"],
	);
	assert.equal(sections(FALLBACK_PACK.reference)[0].rows.length, 12);
});

test("an empty query keeps every section, unfilled ones included", () => {
	assert.deepEqual(filter(all, ""), all);
	assert.deepEqual(filter(all, "   "), all);
});

test("a query matches a name, a cost, or the rule text", () => {
	assert.deepEqual(filter(all, "attack"), [
		{ title: "Effects", rows: [all[0].rows[0]] },
	]);
	assert.deepEqual(filter(all, "1 power"), [
		{ title: "Effects", rows: [all[0].rows[0]] },
	]);
	assert.deepEqual(filter(all, "status"), [
		{ title: "Effects", rows: [all[0].rows[0]] },
	]);
	assert.deepEqual(filter(all, "bees"), []);
});

test("a section a title matches keeps every row, filled or not", () => {
	assert.deepEqual(filter(all, "scale"), [all[1]]);
	assert.deepEqual(filter(all, "effects"), [all[0]]);
});

test("an unfilled row still answers to its name", () => {
	assert.deepEqual(filter(all, "discover"), [
		{ title: "Effects", rows: [all[0].rows[1]] },
	]);
});
