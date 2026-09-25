import type { Status, Valence } from "@/lib/character/types";
import { DEFAULT_STATUS_LIMIT } from "@/lib/rules/constants";
import {
	clearStatusTier,
	raiseStatus,
	resizeStatusLimit,
} from "@/lib/rules/status";
import { newNpc } from "./new.ts";
import {
	addStoryTag,
	burnStoryTag,
	removeStoryTag,
	renameStoryTag,
	setStoryTagValence,
	toggleStoryTagCrispy,
} from "./story-tag.ts";
import type { Campaign, Npc } from "./types.ts";

export type CampaignAction =
	| { type: "replace"; document: Campaign }
	| { type: "rename"; name: string }
	| { type: "setNotes"; notes: string }
	| { type: "addStoryTag"; id: string; valence: Valence }
	| { type: "renameStoryTag"; id: string; name: string }
	| { type: "setStoryTagValence"; id: string; valence: Valence }
	| { type: "burnStoryTag"; id: string; burnValue: number }
	| { type: "toggleStoryTagCrispy"; id: string }
	| { type: "removeStoryTag"; id: string }
	| { type: "addNpc"; id: string }
	| { type: "renameNpc"; npcId: string; name: string }
	| { type: "setNpcNotes"; npcId: string; notes: string }
	| { type: "removeNpc"; npcId: string }
	| { type: "addNpcStoryTag"; npcId: string; id: string; valence: Valence }
	| { type: "renameNpcStoryTag"; npcId: string; id: string; name: string }
	| {
			type: "setNpcStoryTagValence";
			npcId: string;
			id: string;
			valence: Valence;
	  }
	| { type: "burnNpcStoryTag"; npcId: string; id: string; burnValue: number }
	| { type: "toggleNpcStoryTagCrispy"; npcId: string; id: string }
	| { type: "removeNpcStoryTag"; npcId: string; id: string }
	| { type: "addNpcStatus"; npcId: string; id: string; valence: Valence }
	| { type: "renameNpcStatus"; npcId: string; id: string; name: string }
	| {
			type: "setNpcStatusValence";
			npcId: string;
			id: string;
			valence: Valence;
	  }
	| { type: "removeNpcStatus"; npcId: string; id: string }
	| { type: "markNpcStatusTier"; npcId: string; id: string; tier: number }
	| { type: "clearNpcStatusTier"; npcId: string; id: string; tier: number };

/** Every NPC verb below edits one NPC and leaves the rest alone. */
function inNpc(
	campaign: Campaign,
	npcId: string,
	edit: (npc: Npc) => Npc,
): Campaign {
	return {
		...campaign,
		npcs: campaign.npcs.map((npc) => (npc.id === npcId ? edit(npc) : npc)),
	};
}

function inNpcStatus(
	npc: Npc,
	id: string,
	edit: (status: Status) => Status,
): Npc {
	return {
		...npc,
		statuses: npc.statuses.map((status) =>
			status.id === id ? edit(status) : status,
		),
	};
}

export function reduce(campaign: Campaign, action: CampaignAction): Campaign {
	switch (action.type) {
		case "replace":
			return action.document;
		case "rename":
			return { ...campaign, name: action.name };
		case "setNotes":
			return { ...campaign, notes: action.notes };
		case "addStoryTag":
			return {
				...campaign,
				storyTags: addStoryTag(campaign.storyTags, action.id, action.valence),
			};
		case "renameStoryTag":
			return {
				...campaign,
				storyTags: renameStoryTag(campaign.storyTags, action.id, action.name),
			};
		case "setStoryTagValence":
			return {
				...campaign,
				storyTags: setStoryTagValence(
					campaign.storyTags,
					action.id,
					action.valence,
				),
			};
		case "burnStoryTag":
			return {
				...campaign,
				storyTags: burnStoryTag(
					campaign.storyTags,
					action.id,
					action.burnValue,
				),
			};
		case "toggleStoryTagCrispy":
			return {
				...campaign,
				storyTags: toggleStoryTagCrispy(campaign.storyTags, action.id),
			};
		case "removeStoryTag":
			return {
				...campaign,
				storyTags: removeStoryTag(campaign.storyTags, action.id),
			};
		case "addNpc":
			return { ...campaign, npcs: [...campaign.npcs, newNpc(action.id)] };
		case "renameNpc":
			return inNpc(campaign, action.npcId, (npc) => ({
				...npc,
				name: action.name,
			}));
		case "setNpcNotes":
			return inNpc(campaign, action.npcId, (npc) => ({
				...npc,
				notes: action.notes,
			}));
		case "removeNpc":
			return {
				...campaign,
				npcs: campaign.npcs.filter((npc) => npc.id !== action.npcId),
			};
		case "addNpcStoryTag":
			return inNpc(campaign, action.npcId, (npc) => ({
				...npc,
				storyTags: addStoryTag(npc.storyTags, action.id, action.valence),
			}));
		case "renameNpcStoryTag":
			return inNpc(campaign, action.npcId, (npc) => ({
				...npc,
				storyTags: renameStoryTag(npc.storyTags, action.id, action.name),
			}));
		case "setNpcStoryTagValence":
			return inNpc(campaign, action.npcId, (npc) => ({
				...npc,
				storyTags: setStoryTagValence(
					npc.storyTags,
					action.id,
					action.valence,
				),
			}));
		case "burnNpcStoryTag":
			return inNpc(campaign, action.npcId, (npc) => ({
				...npc,
				storyTags: burnStoryTag(npc.storyTags, action.id, action.burnValue),
			}));
		case "toggleNpcStoryTagCrispy":
			return inNpc(campaign, action.npcId, (npc) => ({
				...npc,
				storyTags: toggleStoryTagCrispy(npc.storyTags, action.id),
			}));
		case "removeNpcStoryTag":
			return inNpc(campaign, action.npcId, (npc) => ({
				...npc,
				storyTags: removeStoryTag(npc.storyTags, action.id),
			}));
		case "addNpcStatus": {
			const status: Status = {
				id: action.id,
				name: "",
				valence: action.valence,
				tiers: resizeStatusLimit([true], DEFAULT_STATUS_LIMIT),
				limit: DEFAULT_STATUS_LIMIT,
			};
			return inNpc(campaign, action.npcId, (npc) => ({
				...npc,
				statuses: [...npc.statuses, status],
			}));
		}
		case "renameNpcStatus":
			return inNpc(campaign, action.npcId, (npc) =>
				inNpcStatus(npc, action.id, (status) => ({
					...status,
					// Same shorthand rule as lib/character/reducer.ts's renameStatus:
					// exhausted-2, amped-up-2.
					name: action.name.toLowerCase().replaceAll(" ", "-"),
				})),
			);
		case "setNpcStatusValence":
			return inNpc(campaign, action.npcId, (npc) =>
				inNpcStatus(npc, action.id, (status) => ({
					...status,
					valence: action.valence,
				})),
			);
		case "removeNpcStatus":
			return inNpc(campaign, action.npcId, (npc) => ({
				...npc,
				statuses: npc.statuses.filter((status) => status.id !== action.id),
			}));
		case "markNpcStatusTier":
			return inNpc(campaign, action.npcId, (npc) =>
				inNpcStatus(npc, action.id, (status) => ({
					...status,
					tiers: raiseStatus(status.tiers, action.tier, status.limit),
				})),
			);
		case "clearNpcStatusTier":
			return inNpc(campaign, action.npcId, (npc) =>
				inNpcStatus(npc, action.id, (status) => ({
					...status,
					tiers: clearStatusTier(status.tiers, action.tier),
				})),
			);
	}
}
