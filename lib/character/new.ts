import { CURRENT_SCHEMA_VERSION } from "./migrate.ts";
import type { Character } from "./types.ts";

/** A blank document at the current schema version, ready for guided creation. */
export function newCharacter(): Character {
  return {
    schema_version: CURRENT_SCHEMA_VERSION,
    name: "",
    essence: "",
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
    themes: [],
    loadout: { themeIds: [], tags: [], specials: [], availablePower: 1, upgrade: 0 },
    ghostMemories: [],
    statuses: [],
    storyTags: [],
    creationStep: 1,
  };
}
