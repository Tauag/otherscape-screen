import { CURRENT_SCHEMA_VERSION } from "../migrate.ts";
import type { Campaign } from "../types.ts";

/** An invented campaign, exercising a burnt and a crispy story tag, and an
 *  NPC with its own story tags and a non-contiguous status. */
export const sample: Campaign = {
	schema_version: CURRENT_SCHEMA_VERSION,
	name: "The Lantern Street Job",
	notes: "Corpsec is leaning on the docks. The crew has two weeks.",
	storyTags: [
		{
			id: "cst-1",
			name: "the syndicate is watching the docks",
			valence: "negative",
			burnt: false,
			crispy: false,
		},
		{
			id: "cst-2",
			name: "a friendly face at corpsec",
			valence: "positive",
			burnt: true,
			crispy: false,
		},
	],
	npcs: [
		{
			id: "npc-1",
			name: "Detective Oyelaran",
			notes: "Owed a favour by Kira. Doesn't know it yet.",
			storyTags: [
				{
					id: "nst-1",
					name: "still has friends in corpsec",
					valence: "positive",
					burnt: false,
					crispy: true,
				},
			],
			statuses: [
				{
					id: "nss-1",
					name: "hunted-by-the-syndicate",
					valence: "negative",
					tiers: [true, false, true, false, false, false],
					limit: 6,
				},
			],
		},
	],
};
