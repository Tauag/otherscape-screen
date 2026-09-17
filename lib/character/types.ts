// The whole character sheet, as it sits in `characters.data`. Types only.

/** Lowercase to match the `data-type` values in app/globals.css. */
export type ThemeType = "self" | "mythos" | "noise";

/** Lowercase to match the `data-valence` values in app/globals.css. */
export type Valence = "positive" | "negative";

/** The eight Essences, chosen by the player from the theme mix. */
export type Essence =
	| "Real"
	| "Avatar"
	| "Conduit"
	| "Singularity"
	| "Spiritualist"
	| "Cyborg"
	| "Transhuman"
	| "Nexus";

/** Upgrade and Decay are 3 boxes filled left to right, so a count is the whole truth. */
export type MarkCount = 0 | 1 | 2 | 3;

export type PowerQuestionLetter =
	| "A"
	| "B"
	| "C"
	| "D"
	| "E"
	| "F"
	| "G"
	| "H"
	| "I"
	| "J";

export type WeaknessQuestionLetter = "A" | "B" | "C" | "D";

export type PowerTag = {
	/** Assigned at creation. A question may be answered twice, so letter is a label, never a key. */
	id: string;
	/** Theme specials let a tag answer another themebook's question, so the tag records the source. */
	themebook: string;
	letter: PowerQuestionLetter;
	text: string;
	burnt: boolean;
	/** The Power a burn is worth. Absent reads as the default, because theme specials set 4 or 5. */
	burnValue?: number;
};

export type WeaknessTag = {
	id: string;
	letter: WeaknessQuestionLetter;
	text: string;
};

export type Theme = {
	id: string;
	type: ThemeType;
	/** Free text, because a homebrew themebook is allowed. */
	themebook: string;
	powerTags: PowerTag[];
	weaknessTags: WeaknessTag[];
	/** The Identity, Ritual, or Itch line. The theme type names it. */
	quote: string;
	specials: string[];
	upgrade: MarkCount;
	decay: MarkCount;
};

export type LoadoutFeatureTag = {
	id: string;
	text: string;
	/** Loading it costs Power. It can't load before its set's title does. */
	loaded: boolean;
	/** Only a loaded feature can burn. Unloading it clears this automatically. */
	burnt: boolean;
};

/** Loads for free the instant its set's title loads. No cost, no toggle. */
export type LoadoutWeaknessTag = {
	id: string;
	text: string;
};

/**
 * A title tag, its features, and its weaknesses, written permanently. Only
 * loaded tags are usable in play; loading one spends Power during Loading Up.
 */
export type LoadoutSet = {
	id: string;
	title: string;
	titleLoaded: boolean;
	/** Only a loaded title can burn. Unloading it clears this automatically. */
	titleBurnt: boolean;
	features: LoadoutFeatureTag[];
	weaknesses: LoadoutWeaknessTag[];
};

/** The loadout is itself a theme: its own Upgrade track, and no Decay track. */
export type Loadout = {
	sets: LoadoutSet[];
	/** Slots reserved to load a tag mid-session, outside Loading Up. 2P each. */
	wildcards: number;
	specials: string[];
	/** A budget the app warns against, never enforces. Starts at 1. */
	availablePower: number;
	upgrade: MarkCount;
};

/** An archived theme, kept whole, because the sheet's three-field version loses the rest. */
export type GhostMemory = {
	id: string;
	theme: Theme;
	/** ISO 8601. JSON carries no Date. */
	lostAt: string;
	reason: string;
};

/**
 * One box per tier, 1 to 6. An array rather than a count, because the stacking
 * and removal rules mark and shift individual tiers.
 */
export type TierMarks = [boolean, boolean, boolean, boolean, boolean, boolean];

export type Status = {
	id: string;
	name: string;
	valence: Valence;
	tiers: TierMarks;
	owner: "mine" | "mc";
	/** A spent card, kept on the table. */
	out: boolean;
};

export type StoryTag = {
	id: string;
	name: string;
	valence: Valence;
	scratched: boolean;
};

export type CrewRelationship = {
	id: string;
	member: string;
	tag: string;
};

/** Named by the type, on a normal theme; a crew theme has no type to derive it
 *  from, so the player picks one directly. */
export type CrewMotivation = "Identity" | "Ritual" | "Itch";

/**
 * The crew's own theme (core rules, page 75). Every character carries their
 * copy: same power and weakness tags, Upgrade and Decay tracks, and quote line
 * as a self/mythos/noise theme, but no type and no themebook - a crew is not
 * built from one.
 */
export type CrewTheme = {
	powerTags: PowerTag[];
	weaknessTags: WeaknessTag[];
	motivation: CrewMotivation;
	quote: string;
	specials: string[];
	upgrade: MarkCount;
	decay: MarkCount;
};

/** The fixed Evolution list. Veteran Specials is an x3 box, so it counts. */
export type Evolutions = {
	newEssenceType: boolean;
	broadPowerTag: boolean;
	veteranSpecials: MarkCount;
	rideOffIntoTheSunset: boolean;
	sunderTheCosmology: boolean;
	totalReconstitution: boolean;
};

export type Character = {
	/** Snake case because the whole document versions on this one key. */
	schema_version: number;
	/** Top-level: the `characters.name` generated column reads `data->>'name'`. */
	name: string;
	/** Top-level: the `characters.essence` generated column reads `data->>'essence'`. Empty until chosen. */
	essence: Essence | "";
	/** False while `essence` is the app's own derivation, so it keeps tracking the theme mix. True once the player picks via `setEssence`, which freezes it. */
	essenceChosen: boolean;
	playerName: string;
	appearance: string;
	background: string;
	/** Set by the Essence, but the text belongs to the rulebook, so the player writes it. */
	essenceSpecial: string;
	/** Up to 3. The app warns past that, never blocks. */
	veteranSpecials: string[];
	evolutions: Evolutions;
	crew: CrewRelationship[];
	crewTheme: CrewTheme;
	themes: Theme[];
	loadout: Loadout;
	ghostMemories: GhostMemory[];
	statuses: Status[];
	storyTags: StoryTag[];
	/** Step 1-10 of guided creation, or null once it is finished. */
	creationStep: number | null;
};
