// The whole campaign, as it sits in `campaigns.data`. Types only.
// sysdesign 3, 14: StoryTag and Status are lib/character/types.ts's existing
// types, unchanged - a campaign story tag and a challenge status are the same
// shape a character's are.

import type { Status, StoryTag } from "@/lib/character/types";

/** A unique behavior a challenge can do, a few sentences of free text. */
export type Special = { id: string; text: string };

export type Challenge = {
	id: string;
	name: string;
	notes: string;
	storyTags: StoryTag[];
	statuses: Status[];
	specials: Special[];
	/** In the current scene, or benched (prepped but idle). */
	inScene: boolean;
};

export type Campaign = {
	/** Snake case because the whole document versions on this one key, same as Character. */
	schema_version: number;
	/** Top-level: the `campaigns.name` generated column reads `data->>'name'`. */
	name: string;
	notes: string;
	storyTags: StoryTag[];
	challenges: Challenge[];
};
