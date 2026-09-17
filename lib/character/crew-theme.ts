// Pure edit functions for the crew theme, mirroring theme.ts's tag and track
// verbs. Kept separate because a crew theme has no type and no themebook, so
// the tag verbs here never touch either.

import {
	DECAY_TRACK_LENGTH,
	DEFAULT_BURN_VALUE,
	UPGRADE_TRACK_LENGTH,
} from "../rules/constants.ts";
import type { MoveDirection, TagKind, TrackName } from "./theme.ts";
import type {
	CrewTheme,
	MarkCount,
	PowerQuestionLetter,
	PowerTag,
	WeaknessQuestionLetter,
	WeaknessTag,
} from "./types.ts";

/** Reads as under construction until it has all three power tags, same as any other theme. */
export function isCrewNascent(crew: CrewTheme): boolean {
	return crew.powerTags.length < 3;
}

/** The crew card's name: the first power tag answering question A. */
export function crewTitle(crew: CrewTheme): PowerTag | undefined {
	return crew.powerTags.find((tag) => tag.letter === "A");
}

/** The id comes from the caller, because a reducer has to stay pure. */
export function addCrewPowerTag(
	crew: CrewTheme,
	id: string,
	letter: PowerQuestionLetter,
): CrewTheme {
	const tag: PowerTag = { id, themebook: "", letter, text: "", burnt: false };
	return { ...crew, powerTags: [...crew.powerTags, tag] };
}

export function addCrewWeaknessTag(
	crew: CrewTheme,
	id: string,
	letter: WeaknessQuestionLetter,
): CrewTheme {
	return {
		...crew,
		weaknessTags: [...crew.weaknessTags, { id, letter, text: "" }],
	};
}

export function editCrewPowerTag(
	crew: CrewTheme,
	tagId: string,
	edit: Partial<Pick<PowerTag, "letter" | "text">>,
): CrewTheme {
	return {
		...crew,
		powerTags: crew.powerTags.map((tag) =>
			tag.id === tagId ? { ...tag, ...edit } : tag,
		),
	};
}

export function editCrewWeaknessTag(
	crew: CrewTheme,
	tagId: string,
	edit: Partial<Pick<WeaknessTag, "letter" | "text">>,
): CrewTheme {
	return {
		...crew,
		weaknessTags: crew.weaknessTags.map((tag) =>
			tag.id === tagId ? { ...tag, ...edit } : tag,
		),
	};
}

export function deleteCrewPowerTag(crew: CrewTheme, tagId: string): CrewTheme {
	return {
		...crew,
		powerTags: crew.powerTags.filter((tag) => tag.id !== tagId),
	};
}

export function deleteCrewWeaknessTag(
	crew: CrewTheme,
	tagId: string,
): CrewTheme {
	return {
		...crew,
		weaknessTags: crew.weaknessTags.filter((tag) => tag.id !== tagId),
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

export function moveCrewTag(
	crew: CrewTheme,
	kind: TagKind,
	tagId: string,
	direction: MoveDirection,
): CrewTheme {
	return kind === "power"
		? { ...crew, powerTags: swapped(crew.powerTags, tagId, direction) }
		: { ...crew, weaknessTags: swapped(crew.weaknessTags, tagId, direction) };
}

function burnt(tag: PowerTag, burnValue: number): PowerTag {
	const next: PowerTag = { ...tag, burnt: true, burnValue };
	if (burnValue === DEFAULT_BURN_VALUE) delete next.burnValue;
	return next;
}

export function burnCrewTag(
	crew: CrewTheme,
	tagId: string,
	burnValue: number,
): CrewTheme {
	return {
		...crew,
		powerTags: crew.powerTags.map((tag) =>
			tag.id === tagId ? burnt(tag, burnValue) : tag,
		),
	};
}

export function unburnCrewTag(crew: CrewTheme, tagId: string): CrewTheme {
	return {
		...crew,
		powerTags: crew.powerTags.map((tag) => {
			if (tag.id !== tagId) return tag;
			const next: PowerTag = { ...tag, burnt: false };
			delete next.burnValue;
			return next;
		}),
	};
}

const TRACK_LENGTH: Record<TrackName, number> = {
	upgrade: UPGRADE_TRACK_LENGTH,
	decay: DECAY_TRACK_LENGTH,
};

/** Same wrap-to-empty rule as a theme's track (theme.ts's markTrack). */
export function markCrewTrack(crew: CrewTheme, track: TrackName): CrewTheme {
	const marked = crew[track];
	const next = marked >= TRACK_LENGTH[track] ? 0 : ((marked + 1) as MarkCount);
	const cleared = track === "upgrade" && next >= UPGRADE_TRACK_LENGTH;
	return { ...crew, [track]: cleared ? 0 : next };
}
