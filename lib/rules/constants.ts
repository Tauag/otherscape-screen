// Every open number of the rules, in one place. Answering an open question
// (PRD section 9) is a one-line edit here, not a search.

/** Points on a theme's Upgrade track, and on the loadout's. */
export const UPGRADE_TRACK_LENGTH = 3;

/** Boxes on a theme's Decay track (O2). */
export const DECAY_TRACK_LENGTH = 3;

/** Themes a character starts with, loadout and crew theme excluded (O3). */
export const STARTING_THEMES = 4;

/** Power tags a starting theme holds, the title tag included (O4). */
export const STARTING_POWER_TAGS = 3;

/** Weakness tags a starting theme holds (O4). */
export const STARTING_WEAKNESS_TAGS = 1;

/** The one starting theme the player may build larger takes these instead (O4). */
export const LARGER_THEME_POWER_TAGS = 4;
export const LARGER_THEME_WEAKNESS_TAGS = 2;

/** Loadout Power a character starts with (O5). */
export const STARTING_LOADOUT_POWER = 1;

/** Power a burnt tag adds. Theme specials raise it to 4 or 5 per burn (PRD 7.8). */
export const DEFAULT_BURN_VALUE = 3;

/** Highest status tier. A mark pushed past it is dropped (PRD 6). */
export const MAX_STATUS_TIER = 6;

/** Loadout Power a tag costs, and a wildcard tag (PRD 7.6). A flaw costs nothing. */
export const LOADOUT_TAG_COST = 1;
export const WILDCARD_TAG_COST = 2;
