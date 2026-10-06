import { decayFull } from "@/lib/character/loss";
import { themeTitle } from "@/lib/character/theme";
import type { Character } from "@/lib/character/types";
import { essenceSuggestion } from "@/lib/rules/essence-suggestion";
import { themeCountWarning } from "@/lib/rules/readiness";

export function boardWarnings(character: Character): string[] {
	const warnings: string[] = [];

	if (character.themes.length === 0) {
		warnings.push("This character has no themes yet.");
	}

	const count = themeCountWarning(character.themes.length);
	if (count) warnings.push(count);

	const { candidates, state } = essenceSuggestion(
		character.themes,
		character.essence,
	);
	if (state === "unchosen" && candidates.length > 1) {
		warnings.push(
			`Your themes tie between ${candidates[0]} and ${candidates[1]}. Pick one from the menu.`,
		);
	}

	for (const theme of character.themes) {
		if (decayFull(theme)) {
			const named = themeTitle(theme)?.text.trim() || "A theme";
			warnings.push(`${named}'s Decay track is full.`);
		}
	}
	if (decayFull(character.crewTheme)) {
		warnings.push("The crew's Decay track is full.");
	}

	return warnings;
}
