import assert from "node:assert/strict";
import { test } from "node:test";
import {
	DEFAULT_BURN_VALUE,
	DEFAULT_STATUS_LIMIT,
} from "@/lib/rules/constants";
import { newCampaign } from "../new.ts";
import { reduce } from "../reducer.ts";
import type { Campaign } from "../types.ts";
import { sample } from "./sample.ts";

test("replace swaps in a whole document", () => {
	const campaign = newCampaign();
	assert.deepEqual(
		reduce(campaign, { type: "replace", document: sample }),
		sample,
	);
});

test("rename sets the campaign name", () => {
	const campaign = reduce(newCampaign(), {
		type: "rename",
		name: "The Lantern Street Job",
	});
	assert.equal(campaign.name, "The Lantern Street Job");
});

test("setNotes sets the campaign notes", () => {
	const campaign = reduce(newCampaign(), {
		type: "setNotes",
		notes: "Corpsec is leaning on the docks.",
	});
	assert.equal(campaign.notes, "Corpsec is leaning on the docks.");
});

// --- Campaign story tags ---------------------------------------------------

test("addStoryTag appends a blank tag of the given valence", () => {
	const campaign = reduce(newCampaign(), {
		type: "addStoryTag",
		id: "cst-1",
		valence: "positive",
	});
	assert.deepEqual(campaign.storyTags, [
		{ id: "cst-1", name: "", valence: "positive", burnt: false, crispy: false },
	]);
});

test("renameStoryTag edits one tag and leaves the rest alone", () => {
	let campaign = reduce(newCampaign(), {
		type: "addStoryTag",
		id: "cst-1",
		valence: "positive",
	});
	campaign = reduce(campaign, {
		type: "addStoryTag",
		id: "cst-2",
		valence: "negative",
	});
	campaign = reduce(campaign, {
		type: "renameStoryTag",
		id: "cst-1",
		name: "a friendly face at corpsec",
	});
	assert.equal(campaign.storyTags[0].name, "a friendly face at corpsec");
	assert.equal(campaign.storyTags[1].name, "");
});

test("setStoryTagValence flips a tag's valence", () => {
	let campaign = reduce(newCampaign(), {
		type: "addStoryTag",
		id: "cst-1",
		valence: "positive",
	});
	campaign = reduce(campaign, {
		type: "setStoryTagValence",
		id: "cst-1",
		valence: "negative",
	});
	assert.equal(campaign.storyTags[0].valence, "negative");
});

test("burnStoryTag burns a positive tag, and the default value stays absent", () => {
	let campaign = reduce(newCampaign(), {
		type: "addStoryTag",
		id: "cst-1",
		valence: "positive",
	});
	campaign = reduce(campaign, {
		type: "burnStoryTag",
		id: "cst-1",
		burnValue: DEFAULT_BURN_VALUE,
	});
	assert.deepEqual(campaign.storyTags[0], {
		id: "cst-1",
		name: "",
		valence: "positive",
		burnt: true,
		crispy: false,
	});

	const custom = reduce(
		reduce(newCampaign(), {
			type: "addStoryTag",
			id: "cst-1",
			valence: "positive",
		}),
		{ type: "burnStoryTag", id: "cst-1", burnValue: 5 },
	);
	assert.equal(custom.storyTags[0].burnValue, 5);
});

test("burnStoryTag does nothing to a negative or a crispy tag", () => {
	let campaign = reduce(newCampaign(), {
		type: "addStoryTag",
		id: "cst-1",
		valence: "negative",
	});
	campaign = reduce(campaign, {
		type: "burnStoryTag",
		id: "cst-1",
		burnValue: DEFAULT_BURN_VALUE,
	});
	assert.equal(campaign.storyTags[0].burnt, false);

	let crispy = reduce(newCampaign(), {
		type: "addStoryTag",
		id: "cst-2",
		valence: "positive",
	});
	crispy = reduce(crispy, { type: "toggleStoryTagCrispy", id: "cst-2" });
	crispy = reduce(crispy, {
		type: "burnStoryTag",
		id: "cst-2",
		burnValue: DEFAULT_BURN_VALUE,
	});
	assert.equal(crispy.storyTags[0].burnt, false);
});

test("toggleStoryTagCrispy toggles, and going crispy un-burns", () => {
	let campaign = reduce(newCampaign(), {
		type: "addStoryTag",
		id: "cst-1",
		valence: "positive",
	});
	campaign = reduce(campaign, {
		type: "burnStoryTag",
		id: "cst-1",
		burnValue: 5,
	});
	campaign = reduce(campaign, { type: "toggleStoryTagCrispy", id: "cst-1" });
	assert.deepEqual(campaign.storyTags[0], {
		id: "cst-1",
		name: "",
		valence: "positive",
		burnt: false,
		crispy: true,
	});

	campaign = reduce(campaign, { type: "toggleStoryTagCrispy", id: "cst-1" });
	assert.equal(campaign.storyTags[0].crispy, false);
});

test("removeStoryTag drops one tag and keeps the rest", () => {
	let campaign = reduce(newCampaign(), {
		type: "addStoryTag",
		id: "cst-1",
		valence: "positive",
	});
	campaign = reduce(campaign, {
		type: "addStoryTag",
		id: "cst-2",
		valence: "negative",
	});
	campaign = reduce(campaign, { type: "removeStoryTag", id: "cst-1" });
	assert.deepEqual(
		campaign.storyTags.map((tag) => tag.id),
		["cst-2"],
	);
});

// --- NPCs --------------------------------------------------------------

test("addNpc appends a blank NPC", () => {
	const campaign = reduce(newCampaign(), { type: "addNpc", id: "npc-1" });
	assert.deepEqual(campaign.npcs, [
		{ id: "npc-1", name: "", notes: "", storyTags: [], statuses: [] },
	]);
});

test("renameNpc and setNpcNotes edit one NPC and leave the rest alone", () => {
	let campaign = reduce(newCampaign(), { type: "addNpc", id: "npc-1" });
	campaign = reduce(campaign, { type: "addNpc", id: "npc-2" });
	campaign = reduce(campaign, {
		type: "renameNpc",
		npcId: "npc-1",
		name: "Detective Oyelaran",
	});
	campaign = reduce(campaign, {
		type: "setNpcNotes",
		npcId: "npc-1",
		notes: "Owed a favour.",
	});
	assert.equal(campaign.npcs[0].name, "Detective Oyelaran");
	assert.equal(campaign.npcs[0].notes, "Owed a favour.");
	assert.equal(campaign.npcs[1].name, "");
});

test("removeNpc drops one NPC and keeps the rest", () => {
	let campaign = reduce(newCampaign(), { type: "addNpc", id: "npc-1" });
	campaign = reduce(campaign, { type: "addNpc", id: "npc-2" });
	campaign = reduce(campaign, { type: "removeNpc", npcId: "npc-1" });
	assert.deepEqual(
		campaign.npcs.map((npc) => npc.id),
		["npc-2"],
	);
});

// --- An NPC's story tags: same verbs, scoped to one NPC ------------------

function withNpc(): Campaign {
	return reduce(newCampaign(), { type: "addNpc", id: "npc-1" });
}

test("an NPC's story tags are created, edited, and removed independently of the campaign's own", () => {
	let campaign = withNpc();
	campaign = reduce(campaign, {
		type: "addStoryTag",
		id: "cst-1",
		valence: "positive",
	});
	campaign = reduce(campaign, {
		type: "addNpcStoryTag",
		npcId: "npc-1",
		id: "nst-1",
		valence: "negative",
	});
	assert.equal(campaign.storyTags.length, 1);
	assert.deepEqual(campaign.npcs[0].storyTags, [
		{ id: "nst-1", name: "", valence: "negative", burnt: false, crispy: false },
	]);

	campaign = reduce(campaign, {
		type: "renameNpcStoryTag",
		npcId: "npc-1",
		id: "nst-1",
		name: "still has friends in corpsec",
	});
	assert.equal(
		campaign.npcs[0].storyTags[0].name,
		"still has friends in corpsec",
	);
	assert.equal(campaign.storyTags[0].name, ""); // the campaign's own tag, untouched

	campaign = reduce(campaign, {
		type: "setNpcStoryTagValence",
		npcId: "npc-1",
		id: "nst-1",
		valence: "positive",
	});
	assert.equal(campaign.npcs[0].storyTags[0].valence, "positive");

	campaign = reduce(campaign, {
		type: "burnNpcStoryTag",
		npcId: "npc-1",
		id: "nst-1",
		burnValue: DEFAULT_BURN_VALUE,
	});
	assert.equal(campaign.npcs[0].storyTags[0].burnt, true);

	campaign = reduce(campaign, {
		type: "toggleNpcStoryTagCrispy",
		npcId: "npc-1",
		id: "nst-1",
	});
	assert.deepEqual(campaign.npcs[0].storyTags[0], {
		id: "nst-1",
		name: "still has friends in corpsec",
		valence: "positive",
		burnt: false, // toggling crispy un-burns it
		crispy: true,
	});

	campaign = reduce(campaign, {
		type: "removeNpcStoryTag",
		npcId: "npc-1",
		id: "nst-1",
	});
	assert.deepEqual(campaign.npcs[0].storyTags, []);
});

test("an NPC story tag verb touches only its own NPC", () => {
	let campaign = withNpc();
	campaign = reduce(campaign, { type: "addNpc", id: "npc-2" });
	campaign = reduce(campaign, {
		type: "addNpcStoryTag",
		npcId: "npc-1",
		id: "nst-1",
		valence: "positive",
	});
	assert.equal(campaign.npcs[0].storyTags.length, 1);
	assert.equal(campaign.npcs[1].storyTags.length, 0);
});

// --- An NPC's statuses -----------------------------------------------------

test("addNpcStatus creates a status marked at tier 1, at the default limit", () => {
	const campaign = reduce(withNpc(), {
		type: "addNpcStatus",
		npcId: "npc-1",
		id: "nss-1",
		valence: "negative",
	});
	assert.deepEqual(campaign.npcs[0].statuses, [
		{
			id: "nss-1",
			name: "",
			valence: "negative",
			tiers: [true, false, false, false, false, false],
			limit: DEFAULT_STATUS_LIMIT,
		},
	]);
});

test("renameNpcStatus normalizes to lowercase kebab-case", () => {
	let campaign = reduce(withNpc(), {
		type: "addNpcStatus",
		npcId: "npc-1",
		id: "nss-1",
		valence: "negative",
	});
	campaign = reduce(campaign, {
		type: "renameNpcStatus",
		npcId: "npc-1",
		id: "nss-1",
		name: "Hunted By The Syndicate",
	});
	assert.equal(campaign.npcs[0].statuses[0].name, "hunted-by-the-syndicate");
});

test("setNpcStatusValence flips a status's valence", () => {
	let campaign = reduce(withNpc(), {
		type: "addNpcStatus",
		npcId: "npc-1",
		id: "nss-1",
		valence: "negative",
	});
	campaign = reduce(campaign, {
		type: "setNpcStatusValence",
		npcId: "npc-1",
		id: "nss-1",
		valence: "positive",
	});
	assert.equal(campaign.npcs[0].statuses[0].valence, "positive");
});

test("markNpcStatusTier stacks: marking an already-marked tier marks one higher", () => {
	let campaign = reduce(withNpc(), {
		type: "addNpcStatus",
		npcId: "npc-1",
		id: "nss-1",
		valence: "negative",
	});
	// Tier 1 is already marked by addNpcStatus.
	campaign = reduce(campaign, {
		type: "markNpcStatusTier",
		npcId: "npc-1",
		id: "nss-1",
		tier: 1,
	});
	assert.deepEqual(campaign.npcs[0].statuses[0].tiers, [
		true,
		true,
		false,
		false,
		false,
		false,
	]);
});

test("clearNpcStatusTier clears exactly the one tier, with no shift of the rest", () => {
	let campaign = reduce(withNpc(), {
		type: "addNpcStatus",
		npcId: "npc-1",
		id: "nss-1",
		valence: "negative",
	});
	campaign = reduce(campaign, {
		type: "markNpcStatusTier",
		npcId: "npc-1",
		id: "nss-1",
		tier: 3,
	});
	campaign = reduce(campaign, {
		type: "clearNpcStatusTier",
		npcId: "npc-1",
		id: "nss-1",
		tier: 1,
	});
	assert.deepEqual(campaign.npcs[0].statuses[0].tiers, [
		false,
		false,
		true,
		false,
		false,
		false,
	]);
});

test("removeNpcStatus drops one status and keeps the rest", () => {
	let campaign = reduce(withNpc(), {
		type: "addNpcStatus",
		npcId: "npc-1",
		id: "nss-1",
		valence: "negative",
	});
	campaign = reduce(campaign, {
		type: "addNpcStatus",
		npcId: "npc-1",
		id: "nss-2",
		valence: "positive",
	});
	campaign = reduce(campaign, {
		type: "removeNpcStatus",
		npcId: "npc-1",
		id: "nss-1",
	});
	assert.deepEqual(
		campaign.npcs[0].statuses.map((status) => status.id),
		["nss-2"],
	);
});

test("an NPC status verb touches only its own NPC", () => {
	let campaign = withNpc();
	campaign = reduce(campaign, { type: "addNpc", id: "npc-2" });
	campaign = reduce(campaign, {
		type: "addNpcStatus",
		npcId: "npc-1",
		id: "nss-1",
		valence: "negative",
	});
	assert.equal(campaign.npcs[0].statuses.length, 1);
	assert.equal(campaign.npcs[1].statuses.length, 0);
});
