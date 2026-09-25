// The whole campaign, as it sits in `campaigns.data`. Types only.
// sysdesign 3, 14: StoryTag and Status are lib/character/types.ts's existing
// types, unchanged - a campaign story tag and an NPC status are the same
// shape a character's are.

import type { Status, StoryTag } from "@/lib/character/types";

/**
 * No `themes` field yet: PRD section 10 has full NPC sheets, built from the
 * theme model, as later work. The shape leaves room for it when that lands.
 */
export type Npc = {
	id: string;
	name: string;
	notes: string;
	storyTags: StoryTag[];
	statuses: Status[];
};

export type Campaign = {
	/** Snake case because the whole document versions on this one key, same as Character. */
	schema_version: number;
	/** Top-level: the `campaigns.name` generated column reads `data->>'name'`. */
	name: string;
	notes: string;
	storyTags: StoryTag[];
	npcs: Npc[];
};
