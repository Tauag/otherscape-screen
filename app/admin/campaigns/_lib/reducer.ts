import type { Status, StoryTag, Valence } from "@/lib/character/types";
import { DEFAULT_STATUS_LIMIT } from "@/lib/rules/constants";
import {
	clearStatusTier,
	raiseStatus,
	resizeStatusLimit,
} from "@/lib/rules/status";
import { newChallenge } from "./new.ts";
import {
	addStoryTag,
	burnStoryTag,
	removeStoryTag,
	renameStoryTag,
	setStoryTagValence,
	toggleStoryTagCrispy,
	unburnStoryTag,
} from "./story-tag.ts";
import type { Campaign, Challenge } from "./types.ts";

export type CampaignAction =
	| { type: "replace"; document: Campaign }
	| { type: "setNotes"; notes: string }
	// A story tag verb below omits `challengeId` for the campaign's own list, or
	// carries it for one challenge's - one UI (story-tag-list.tsx) serves both.
	| {
			type: "addStoryTag";
			challengeId?: string;
			id: string;
			name: string;
			valence: Valence;
	  }
	| { type: "renameStoryTag"; challengeId?: string; id: string; name: string }
	| {
			type: "setStoryTagValence";
			challengeId?: string;
			id: string;
			valence: Valence;
	  }
	| {
			type: "burnStoryTag";
			challengeId?: string;
			id: string;
			burnValue: number;
	  }
	| { type: "unburnStoryTag"; challengeId?: string; id: string }
	| { type: "toggleStoryTagCrispy"; challengeId?: string; id: string }
	| { type: "removeStoryTag"; challengeId?: string; id: string }
	| { type: "addChallenge"; id: string }
	| { type: "renameChallenge"; challengeId: string; name: string }
	| { type: "setChallengeNotes"; challengeId: string; notes: string }
	| { type: "removeChallenge"; challengeId: string }
	| {
			type: "addChallengeStatus";
			challengeId: string;
			id: string;
			valence: Valence;
	  }
	| {
			type: "renameChallengeStatus";
			challengeId: string;
			id: string;
			name: string;
	  }
	| {
			type: "setChallengeStatusValence";
			challengeId: string;
			id: string;
			valence: Valence;
	  }
	| { type: "removeChallengeStatus"; challengeId: string; id: string }
	| {
			type: "markChallengeStatusTier";
			challengeId: string;
			id: string;
			tier: number;
	  }
	| {
			type: "clearChallengeStatusTier";
			challengeId: string;
			id: string;
			tier: number;
	  };

/** Every challenge verb below edits one challenge and leaves the rest alone. */
function inChallenge(
	campaign: Campaign,
	challengeId: string,
	edit: (challenge: Challenge) => Challenge,
): Campaign {
	return {
		...campaign,
		challenges: campaign.challenges.map((challenge) =>
			challenge.id === challengeId ? edit(challenge) : challenge,
		),
	};
}

function inChallengeStatus(
	challenge: Challenge,
	id: string,
	edit: (status: Status) => Status,
): Challenge {
	return {
		...challenge,
		statuses: challenge.statuses.map((status) =>
			status.id === id ? edit(status) : status,
		),
	};
}

/** Every story-tag verb below edits one list: the campaign's own (no
 *  `challengeId`) or one challenge's. */
function inStoryTags(
	campaign: Campaign,
	challengeId: string | undefined,
	edit: (tags: StoryTag[]) => StoryTag[],
): Campaign {
	if (challengeId === undefined)
		return { ...campaign, storyTags: edit(campaign.storyTags) };
	return inChallenge(campaign, challengeId, (challenge) => ({
		...challenge,
		storyTags: edit(challenge.storyTags),
	}));
}

export function reduce(campaign: Campaign, action: CampaignAction): Campaign {
	switch (action.type) {
		case "replace":
			return action.document;
		case "setNotes":
			return { ...campaign, notes: action.notes };
		case "addStoryTag":
			return inStoryTags(campaign, action.challengeId, (tags) =>
				addStoryTag(tags, action.id, action.name, action.valence),
			);
		case "renameStoryTag":
			return inStoryTags(campaign, action.challengeId, (tags) =>
				renameStoryTag(tags, action.id, action.name),
			);
		case "setStoryTagValence":
			return inStoryTags(campaign, action.challengeId, (tags) =>
				setStoryTagValence(tags, action.id, action.valence),
			);
		case "burnStoryTag":
			return inStoryTags(campaign, action.challengeId, (tags) =>
				burnStoryTag(tags, action.id, action.burnValue),
			);
		case "unburnStoryTag":
			return inStoryTags(campaign, action.challengeId, (tags) =>
				unburnStoryTag(tags, action.id),
			);
		case "toggleStoryTagCrispy":
			return inStoryTags(campaign, action.challengeId, (tags) =>
				toggleStoryTagCrispy(tags, action.id),
			);
		case "removeStoryTag":
			return inStoryTags(campaign, action.challengeId, (tags) =>
				removeStoryTag(tags, action.id),
			);
		case "addChallenge":
			return {
				...campaign,
				challenges: [...campaign.challenges, newChallenge(action.id)],
			};
		case "renameChallenge":
			return inChallenge(campaign, action.challengeId, (challenge) => ({
				...challenge,
				name: action.name,
			}));
		case "setChallengeNotes":
			return inChallenge(campaign, action.challengeId, (challenge) => ({
				...challenge,
				notes: action.notes,
			}));
		case "removeChallenge":
			return {
				...campaign,
				challenges: campaign.challenges.filter(
					(challenge) => challenge.id !== action.challengeId,
				),
			};
		case "addChallengeStatus": {
			const status: Status = {
				id: action.id,
				name: "",
				valence: action.valence,
				tiers: resizeStatusLimit([true], DEFAULT_STATUS_LIMIT),
				limit: DEFAULT_STATUS_LIMIT,
			};
			return inChallenge(campaign, action.challengeId, (challenge) => ({
				...challenge,
				statuses: [...challenge.statuses, status],
			}));
		}
		case "renameChallengeStatus":
			return inChallenge(campaign, action.challengeId, (challenge) =>
				inChallengeStatus(challenge, action.id, (status) => ({
					...status,
					// Same shorthand rule as lib/character/reducer.ts's renameStatus:
					// exhausted-2, amped-up-2.
					name: action.name.toLowerCase().replaceAll(" ", "-"),
				})),
			);
		case "setChallengeStatusValence":
			return inChallenge(campaign, action.challengeId, (challenge) =>
				inChallengeStatus(challenge, action.id, (status) => ({
					...status,
					valence: action.valence,
				})),
			);
		case "removeChallengeStatus":
			return inChallenge(campaign, action.challengeId, (challenge) => ({
				...challenge,
				statuses: challenge.statuses.filter(
					(status) => status.id !== action.id,
				),
			}));
		case "markChallengeStatusTier":
			return inChallenge(campaign, action.challengeId, (challenge) =>
				inChallengeStatus(challenge, action.id, (status) => ({
					...status,
					tiers: raiseStatus(status.tiers, action.tier, status.limit),
				})),
			);
		case "clearChallengeStatusTier":
			return inChallenge(campaign, action.challengeId, (challenge) =>
				inChallengeStatus(challenge, action.id, (status) => ({
					...status,
					tiers: clearStatusTier(status.tiers, action.tier),
				})),
			);
	}
}
