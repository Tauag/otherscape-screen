import { CURRENT_SCHEMA_VERSION } from "./migrate.ts";
import type { Campaign, Challenge } from "./types.ts";

/** A blank document at the current schema version. */
export function newCampaign(): Campaign {
	return {
		schema_version: CURRENT_SCHEMA_VERSION,
		name: "",
		notes: "",
		storyTags: [],
		challenges: [],
	};
}

/** A blank challenge, ready to name. The id comes from the caller. */
export function newChallenge(id: string): Challenge {
	return {
		id,
		name: "",
		notes: "",
		storyTags: [],
		statuses: [],
		specials: [],
		inScene: true,
	};
}
