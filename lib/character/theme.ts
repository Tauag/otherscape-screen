import {
	DECAY_TRACK_LENGTH,
	DEFAULT_BURN_VALUE,
	UPGRADE_TRACK_LENGTH,
} from "../rules/constants.ts";
import type {
	MarkCount,
	PowerQuestionLetter,
	PowerTag,
	Theme,
	ThemeType,
	WeaknessQuestionLetter,
	WeaknessTag,
} from "./types.ts";

/**
 * One quote line, named by theme type. Checked against the content pack:
 * all 14 themebooks carry `motivation.label`, and it is Identity on every Self
 * book, Ritual on every Mythos book, and Itch on every Noise book. The label
 * therefore follows the type and never needs the themebook.
 */
const LINE_NAME: Record<ThemeType, string> = {
	self: "Identity",
	mythos: "Ritual",
	noise: "Itch",
};

export function themeLine(type: ThemeType): string {
	return LINE_NAME[type];
}

/** What a theme and the crew theme share. Every verb below takes either. */
export type ThemeCard = Pick<
	Theme,
	| "powerTags"
	| "weaknessTags"
	| "quote"
	| "specials"
	| "upgrade"
	| "decay"
	| "pendingUpgrades"
> & { themebook?: string };

/** A theme reads as under construction until it has all three power tags. */
export function isNascent(theme: ThemeCard): boolean {
	return theme.powerTags.length < 3;
}

/** The theme card's name: the first power tag answering question A. */
export function themeTitle(theme: ThemeCard): PowerTag | undefined {
	return theme.powerTags.find((tag) => tag.letter === "A");
}

/**
 * The full range, always. sysdesign 2: a question may be answered again at any
 * time, so no screen removes a letter that already carries a tag.
 */
export const POWER_LETTERS: PowerQuestionLetter[] = [
	"A",
	"B",
	"C",
	"D",
	"E",
	"F",
	"G",
	"H",
	"I",
	"J",
];

export const WEAKNESS_LETTERS: WeaknessQuestionLetter[] = ["A", "B", "C", "D"];

export type TagKind = "power" | "weakness";

export type MoveDirection = "up" | "down";

/** The id comes from the caller, because a reducer has to stay pure. */
export function addPowerTag<T extends ThemeCard>(
	theme: T,
	id: string,
	letter: PowerQuestionLetter,
): T {
	const tag: PowerTag = {
		id,
		// The crew theme has no themebook to borrow from.
		themebook: theme.themebook ?? "",
		letter,
		text: "",
		burnt: false,
	};
	return { ...theme, powerTags: [...theme.powerTags, tag] };
}

export function addWeaknessTag<T extends ThemeCard>(
	theme: T,
	id: string,
	letter: WeaknessQuestionLetter,
): T {
	return {
		...theme,
		weaknessTags: [...theme.weaknessTags, { id, letter, text: "" }],
	};
}

export function editPowerTag<T extends ThemeCard>(
	theme: T,
	tagId: string,
	edit: Partial<Pick<PowerTag, "themebook" | "letter" | "text">>,
): T {
	return {
		...theme,
		powerTags: theme.powerTags.map((tag) =>
			tag.id === tagId ? { ...tag, ...edit } : tag,
		),
	};
}

export function editWeaknessTag<T extends ThemeCard>(
	theme: T,
	tagId: string,
	edit: Partial<Pick<WeaknessTag, "letter" | "text">>,
): T {
	return {
		...theme,
		weaknessTags: theme.weaknessTags.map((tag) =>
			tag.id === tagId ? { ...tag, ...edit } : tag,
		),
	};
}

export function deletePowerTag<T extends ThemeCard>(
	theme: T,
	tagId: string,
): T {
	return {
		...theme,
		powerTags: theme.powerTags.filter((tag) => tag.id !== tagId),
	};
}

export function deleteWeaknessTag<T extends ThemeCard>(
	theme: T,
	tagId: string,
): T {
	return {
		...theme,
		weaknessTags: theme.weaknessTags.filter((tag) => tag.id !== tagId),
	};
}

function swapped<T extends { id: string }>(
	tags: T[],
	tagId: string,
	direction: MoveDirection,
): T[] {
	const from = tags.findIndex((tag) => tag.id === tagId);
	const to = direction === "up" ? from - 1 : from + 1;
	if (from < 0 || to < 0 || to >= tags.length) return tags;

	const next = [...tags];
	[next[from], next[to]] = [next[to], next[from]];
	return next;
}

/**
 * lazy: move-up and move-down, no drag-and-drop (sysdesign 10). The ceiling is a
 * theme with many tags, where dragging would be quicker. The upgrade path is
 * `dnd-kit` on the tag list alone.
 */
export function moveTag<T extends ThemeCard>(
	theme: T,
	kind: TagKind,
	tagId: string,
	direction: MoveDirection,
): T {
	return kind === "power"
		? { ...theme, powerTags: swapped(theme.powerTags, tagId, direction) }
		: { ...theme, weaknessTags: swapped(theme.weaknessTags, tagId, direction) };
}

function burnt(tag: PowerTag, burnValue: number): PowerTag {
	const next: PowerTag = { ...tag, burnt: true, burnValue };
	// types.ts: absent reads as the default, so an untouched 3 stays absent and a
	// later change to DEFAULT_BURN_VALUE still reaches this tag.
	if (burnValue === DEFAULT_BURN_VALUE) delete next.burnValue;
	return next;
}

/** The dialog always sends a number, so a re-burn cannot keep the earlier value. */
export function burnTag<T extends ThemeCard>(
	theme: T,
	tagId: string,
	burnValue: number,
): T {
	return {
		...theme,
		powerTags: theme.powerTags.map((tag) =>
			tag.id === tagId ? burnt(tag, burnValue) : tag,
		),
	};
}

/** The value belongs to the burn and not to the tag, so un-burning drops it. */
export function unburnTag<T extends ThemeCard>(theme: T, tagId: string): T {
	return {
		...theme,
		powerTags: theme.powerTags.map((tag) => {
			if (tag.id !== tagId) return tag;
			const next: PowerTag = { ...tag, burnt: false };
			delete next.burnValue;
			return next;
		}),
	};
}

export function toggleBroadTag<T extends ThemeCard>(
	theme: T,
	tagId: string,
): T {
	return {
		...theme,
		powerTags: theme.powerTags.map((tag) =>
			tag.id === tagId ? { ...tag, broad: !tag.broad } : tag,
		),
	};
}

export type TrackName = "upgrade" | "decay";

const TRACK_LENGTH: Record<TrackName, number> = {
	upgrade: UPGRADE_TRACK_LENGTH,
	decay: DECAY_TRACK_LENGTH,
};

/**
 * One button, one click, one more box. A full track wraps back to empty on the
 * next click, since that's the only way off a Decay track that stays full
 * until the player loses the theme. A filled Upgrade track also owes one more
 * Upgrade - `pendingUpgrades` is the record of that, since the track itself
 * clears back to 0 and can't carry it.
 */
export function markTrack<T extends ThemeCard>(theme: T, track: TrackName): T {
	const marked = theme[track];
	const next = marked >= TRACK_LENGTH[track] ? 0 : ((marked + 1) as MarkCount);
	const filled = track === "upgrade" && next >= UPGRADE_TRACK_LENGTH;
	return {
		...theme,
		[track]: filled ? 0 : next,
		pendingUpgrades: filled ? theme.pendingUpgrades + 1 : theme.pendingUpgrades,
	};
}

/** Resolves one owed Upgrade, whichever the player picks for it: a power tag
 *  or a theme special. Both spend the same point, so both call this. */
export function takeThemeUpgrade<T extends ThemeCard>(theme: T): T {
	return { ...theme, pendingUpgrades: Math.max(0, theme.pendingUpgrades - 1) };
}
