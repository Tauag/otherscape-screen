import { STARTING_LOADOUT_POWER } from "../rules/constants.ts";
import { CURRENT_SCHEMA_VERSION } from "./migrate.ts";
import type { Character, Essence, Theme } from "./types.ts";

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
    loadout: { themeIds: [], tags: [], specials: [], availablePower: STARTING_LOADOUT_POWER, upgrade: 0 },
    ghostMemories: [],
    statuses: [],
    storyTags: [],
    creationStep: 1,
  };
}

/**
 * PRD 7.4: a replacement starts nascent. Two Essences gain a full theme instead:
 * a Conduit, and a Nexus that stays a Nexus after the change. The sheet reads the
 * Essence on the document, and the Nascent checkbox on the theme screen settles
 * the case where the player changes Essence after the replacement.
 */
const FULL_REPLACEMENT: readonly (Essence | "")[] = ["Conduit", "Nexus"];

/** A blank theme, ready for a themebook. The id comes from the caller. */
export function newTheme(id: string, essence: Essence | ""): Theme {
  return {
    id,
    type: "self",
    themebook: "",
    nascent: !FULL_REPLACEMENT.includes(essence),
    titleTagId: null,
    powerTags: [],
    weaknessTags: [],
    quote: "",
    specials: [],
    upgrade: 0,
    decay: 0,
  };
}
