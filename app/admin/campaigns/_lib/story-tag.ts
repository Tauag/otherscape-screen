// Pure StoryTag[] verbs, shared by the campaign's own story tags and every
// NPC's. lib/character/reducer.ts writes this same logic inline for a
// character's storyTags (there's only ever one list there); a campaign has
// two list sites (the campaign, and each NPC), so it's pulled out once here
// instead of copied twice.

import { DEFAULT_BURN_VALUE } from "@/lib/rules/constants";
import type { StoryTag, Valence } from "@/lib/character/types";

export function addStoryTag(
	tags: StoryTag[],
	id: string,
	valence: Valence,
): StoryTag[] {
	return [...tags, { id, name: "", valence, burnt: false, crispy: false }];
}

export function renameStoryTag(
	tags: StoryTag[],
	id: string,
	name: string,
): StoryTag[] {
	return tags.map((tag) => (tag.id === id ? { ...tag, name } : tag));
}

export function setStoryTagValence(
	tags: StoryTag[],
	id: string,
	valence: Valence,
): StoryTag[] {
	return tags.map((tag) => (tag.id === id ? { ...tag, valence } : tag));
}

/**
 * lazy: no unburnStoryTag - design.md 8.2 lists burn but not unburn for a
 * campaign or NPC story tag, unlike a character's (reversible there because
 * the player owns the mistake). Ceiling: a GM who fat-fingers a burn value
 * can't undo it, only re-burn to correct it. Upgrade path: add unburnStoryTag,
 * same shape as lib/character/reducer.ts's, if that turns out to matter.
 */
export function burnStoryTag(
	tags: StoryTag[],
	id: string,
	burnValue: number,
): StoryTag[] {
	return tags.map((tag) => {
		if (tag.id !== id || tag.crispy || tag.valence === "negative") return tag;
		const next: StoryTag = { ...tag, burnt: true, burnValue };
		// Absent reads as the default, same as lib/character/theme.ts's PowerTag,
		// so a later change to DEFAULT_BURN_VALUE still reaches this tag.
		if (burnValue === DEFAULT_BURN_VALUE) delete next.burnValue;
		return next;
	});
}

/** Crispy and burnt can't both hold: going crispy un-burns it. */
export function toggleStoryTagCrispy(tags: StoryTag[], id: string): StoryTag[] {
	return tags.map((tag) => {
		if (tag.id !== id) return tag;
		if (tag.crispy) return { ...tag, crispy: false };
		const next = { ...tag, crispy: true, burnt: false };
		delete next.burnValue;
		return next;
	});
}

export function removeStoryTag(tags: StoryTag[], id: string): StoryTag[] {
	return tags.filter((tag) => tag.id !== id);
}
