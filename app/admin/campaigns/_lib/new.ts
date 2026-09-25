import { CURRENT_SCHEMA_VERSION } from "./migrate.ts";
import type { Campaign, Npc } from "./types.ts";

/** A blank document at the current schema version. */
export function newCampaign(): Campaign {
	return {
		schema_version: CURRENT_SCHEMA_VERSION,
		name: "",
		notes: "",
		storyTags: [],
		npcs: [],
	};
}

/** A blank NPC, ready to name. The id comes from the caller. */
export function newNpc(id: string): Npc {
	return { id, name: "", notes: "", storyTags: [], statuses: [] };
}
