// The roll builder's throwaway selection, and the projection that turns it
// plus the character document into the `RollSelection` that `power()` reads.
// Pure: no React, so the projection is testable on its own.

import type {
	Character,
	LoadoutSet,
	PowerTag,
	StoryTag,
	ThemeType,
	Valence,
} from "@/lib/character/types";
import {
	burnValueOf,
	type RollSelection,
	type SelectedStatus,
	type SelectedTag,
} from "@/lib/rules/power";

/** What the player has tapped for the roll in front of them. Never saved. */
export type RollPick = {
	/** Tag, status, and story tag ids. The document decides the roll's order. */
	ids: string[];
	modifier: number;
	rollWith: ThemeType | null;
	/**
	 * A burnt tag's Power for this roll alone, keyed by tag id. It never reaches
	 * the character document: the sheet's own burn toggle keeps the default.
	 */
	burnValues: Record<string, number>;
};

export const NO_PICK: RollPick = {
	ids: [],
	modifier: 0,
	rollWith: null,
	burnValues: {},
};

/** Power always reads as arithmetic, so every value but 0 carries its sign. */
export function signed(value: number): string {
	if (value === 0) return "0";
	return value < 0 ? `−${-value}` : `+${value}`;
}

/** One selectable tag, whatever part of the sheet it came from. */
export type RollTag = {
	id: string;
	text: string;
	valence: Valence;
	/** The Power a burn is worth, or null when the tag is not burnt. */
	burnValue: number | null;
};

export type RollGroup = {
	id: string;
	/** The hue the group and its chips wear. */
	hue: ThemeType | "crew" | "loadout";
	label: string;
	tags: RollTag[];
};

function powerTag(tag: PowerTag): RollTag {
	return {
		id: tag.id,
		text: tag.text,
		valence: "positive",
		burnValue: burnValueOf(tag),
	};
}

function weaknessTag(tag: { id: string; text: string }): RollTag {
	return { id: tag.id, text: tag.text, valence: "negative", burnValue: null };
}

/** A story tag burns like a power tag, but only on its positive side, and
 * never once it is crispy - a crispy tag is one-time and never spends Power
 * to burn. */
export function storyRollTag(tag: StoryTag): RollTag {
	return {
		id: tag.id,
		text: tag.name,
		valence: tag.valence,
		burnValue:
			tag.valence === "positive" && !tag.crispy ? burnValueOf(tag) : null,
	};
}

/** A loaded set's title, its loaded features, and the weaknesses that came free with the title. */
function loadoutTags(set: LoadoutSet): RollTag[] {
	return [
		{
			id: set.id,
			text: set.title,
			valence: "positive",
			burnValue: burnValueOf({ burnt: set.titleBurnt }),
		},
		...set.features
			.filter((feature) => feature.loaded)
			.map((feature) => ({
				id: feature.id,
				text: feature.text,
				valence: "positive" as Valence,
				burnValue: burnValueOf({ burnt: feature.burnt }),
			})),
		...set.weaknesses.map(weaknessTag),
	];
}

/** Every tag that can reach a roll, grouped as the screen prints them. */
export function rollGroups(character: Character): RollGroup[] {
	const groups: RollGroup[] = character.themes.map((theme) => ({
		id: theme.id,
		hue: theme.type,
		label: `${theme.type} · ${theme.themebook.trim() || "No themebook"}`,
		tags: [
			...theme.powerTags.map(powerTag),
			...theme.weaknessTags.map(weaknessTag),
		],
	}));

	groups.push({
		id: "crew",
		hue: "crew",
		label: `crew · ${character.crewTheme.motivation}`,
		tags: [
			...character.crewTheme.powerTags.map(powerTag),
			...character.crewTheme.weaknessTags.map(weaknessTag),
		],
	});

	groups.push({
		id: "loadout",
		hue: "loadout",
		label: "loadout",
		// Only a loaded set is in play, so only a loaded set's tags can be rolled.
		tags: character.loadout.sets
			.filter((set) => set.titleLoaded)
			.flatMap(loadoutTags),
	});

	return groups.filter((group) => group.tags.length > 0);
}

type TagEntry = { id: string; tag: SelectedTag };
type StatusEntry = { id: string; status: SelectedStatus };

// lazy: a linear `includes` per candidate. The ceiling is a sheet with hundreds
// of tags, where the scan shows on each tap; the upgrade path is a Set.
function picked(
	character: Character,
	pick: RollPick,
): { tags: TagEntry[]; statuses: StatusEntry[] } {
	const chosen = (id: string) => pick.ids.includes(id);

	const tags: TagEntry[] = rollGroups(character)
		.flatMap((group) => group.tags)
		.filter((tag) => chosen(tag.id))
		.map((tag) => ({
			id: tag.id,
			tag: {
				valence: tag.valence,
				burnValue:
					tag.burnValue === null
						? null
						: (pick.burnValues[tag.id] ?? tag.burnValue),
			},
		}));

	const storyTags: TagEntry[] = character.storyTags
		.filter((tag) => chosen(tag.id))
		.map(storyRollTag)
		.map((tag) => ({
			id: tag.id,
			tag: {
				valence: tag.valence,
				burnValue:
					tag.burnValue === null
						? null
						: (pick.burnValues[tag.id] ?? tag.burnValue),
			},
		}));

	const statuses: StatusEntry[] = character.statuses
		.filter((status) => chosen(status.id))
		.map((status) => ({
			id: status.id,
			status: {
				valence: status.valence,
				tier: status.tiers.lastIndexOf(true) + 1,
			},
		}));

	return { tags: [...tags, ...storyTags], statuses };
}

/** The selection `power()` reads, projected from the document and the taps. */
export function toRollSelection(
	character: Character,
	pick: RollPick,
): RollSelection {
	const { tags, statuses } = picked(character, pick);
	return {
		tags: tags.map((entry) => entry.tag),
		statuses: statuses.map((entry) => entry.status),
		modifier: pick.modifier,
		rollWith: pick.rollWith && {
			type: pick.rollWith,
			themeCount: character.themes.filter(
				(theme) => theme.type === pick.rollWith,
			).length,
		},
	};
}

/**
 * The ids behind `power().lines`, in the same order: tags first, then statuses.
 * A `rollWith` line comes before them, so the caller offsets by one.
 */
export function rollOrder(character: Character, pick: RollPick): string[] {
	const { tags, statuses } = picked(character, pick);
	return [...tags, ...statuses].map((entry) => entry.id);
}
