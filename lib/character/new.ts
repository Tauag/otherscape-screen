import { STARTING_LOADOUT_POWER } from "../rules/constants.ts";
import { CURRENT_SCHEMA_VERSION } from "./migrate.ts";
import type { Character, Theme } from "./types.ts";

/** A blank document at the current schema version, ready for guided creation. */
export function newCharacter(): Character {
	return {
		schema_version: CURRENT_SCHEMA_VERSION,
		name: "",
		essence: "",
		essenceChosen: false,
		playerName: "",
		appearance: "",
		background: "",
		essenceSpecial: "",
		veteranSpecials: [],
		evolutions: {
			newEssenceType: false,
			broadPowerTag: false,
			veteranSpecials: 0,
			rideOffIntoTheSunset: false,
			sunderTheCosmology: false,
			totalReconstitution: false,
		},
		crew: [],
		crewTheme: {
			powerTags: [],
			weaknessTags: [],
			motivation: "Identity",
			quote: "",
			specials: [],
			upgrade: 0,
			decay: 0,
		},
		themes: [],
		loadout: {
			sets: [],
			wildcards: 0,
			specials: [],
			availablePower: STARTING_LOADOUT_POWER,
			upgrade: 0,
		},
		ghostMemories: [],
		statuses: [],
		storyTags: [],
		creationStep: 1,
	};
}

/** A blank theme, ready for a themebook. The id comes from the caller. */
export function newTheme(id: string): Theme {
	return {
		id,
		type: "self",
		themebook: "",
		powerTags: [],
		weaknessTags: [],
		quote: "",
		specials: [],
		upgrade: 0,
		decay: 0,
	};
}
