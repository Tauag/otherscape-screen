import type { Status, StoryTag, Valence } from "@/lib/character/types";
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
	unburnStoryTag,
} from "./story-tag.ts";
import type { Campaign, Npc } from "./types.ts";

export type CampaignAction =
	| { type: "replace"; document: Campaign }
	| { type: "rename"; name: string }
	| { type: "setNotes"; notes: string }
	// A story tag verb below omits `npcId` for the campaign's own list, or
	// carries it for one NPC's - one UI (story-tag-list.tsx) serves both.
	| {
			type: "addStoryTag";
			npcId?: string;
			id: string;
			name: string;
			valence: Valence;
	  }
	| { type: "renameStoryTag"; npcId?: string; id: string; name: string }
	| { type: "setStoryTagValence"; npcId?: string; id: string; valence: Valence }
	| { type: "burnStoryTag"; npcId?: string; id: string; burnValue: number }
	| { type: "unburnStoryTag"; npcId?: string; id: string }
	| { type: "toggleStoryTagCrispy"; npcId?: string; id: string }
	| { type: "removeStoryTag"; npcId?: string; id: string }
	| { type: "addNpc"; id: string }
	| { type: "renameNpc"; npcId: string; name: string }
	| { type: "setNpcNotes"; npcId: string; notes: string }
	| { type: "removeNpc"; npcId: string }
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

/** Every story-tag verb below edits one list: the campaign's own (no
 *  `npcId`) or one NPC's. */
function inStoryTags(
	campaign: Campaign,
	npcId: string | undefined,
	edit: (tags: StoryTag[]) => StoryTag[],
): Campaign {
	if (npcId === undefined)
		return { ...campaign, storyTags: edit(campaign.storyTags) };
	return inNpc(campaign, npcId, (npc) => ({
		...npc,
		storyTags: edit(npc.storyTags),
	}));
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
			return inStoryTags(campaign, action.npcId, (tags) =>
				addStoryTag(tags, action.id, action.name, action.valence),
			);
		case "renameStoryTag":
			return inStoryTags(campaign, action.npcId, (tags) =>
				renameStoryTag(tags, action.id, action.name),
			);
		case "setStoryTagValence":
			return inStoryTags(campaign, action.npcId, (tags) =>
				setStoryTagValence(tags, action.id, action.valence),
			);
		case "burnStoryTag":
			return inStoryTags(campaign, action.npcId, (tags) =>
				burnStoryTag(tags, action.id, action.burnValue),
			);
		case "unburnStoryTag":
			return inStoryTags(campaign, action.npcId, (tags) =>
				unburnStoryTag(tags, action.id),
			);
		case "toggleStoryTagCrispy":
			return inStoryTags(campaign, action.npcId, (tags) =>
				toggleStoryTagCrispy(tags, action.id),
			);
		case "removeStoryTag":
			return inStoryTags(campaign, action.npcId, (tags) =>
				removeStoryTag(tags, action.id),
			);
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
