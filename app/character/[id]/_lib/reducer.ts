import {
	addCrewPowerTag,
	addCrewWeaknessTag,
	burnCrewTag,
	deleteCrewPowerTag,
	deleteCrewWeaknessTag,
	editCrewPowerTag,
	editCrewWeaknessTag,
	markCrewTrack,
	moveCrewTag,
	unburnCrewTag,
} from "@/lib/character/crew-theme";
import { loseTheme } from "@/lib/character/loss";
import { newTheme } from "@/lib/character/new";
import {
	addPowerTag,
	addWeaknessTag,
	burnTag,
	deletePowerTag,
	deleteWeaknessTag,
	editPowerTag,
	editWeaknessTag,
	type MoveDirection,
	markTrack,
	moveTag,
	type TagKind,
	type TrackName,
	unburnTag,
} from "@/lib/character/theme";
import type {
	Character,
	CrewMotivation,
	CrewRelationship,
	CrewTheme,
	Essence,
	Loadout,
	PowerQuestionLetter,
	PowerTag,
	Theme,
	ThemeType,
	WeaknessQuestionLetter,
	WeaknessTag,
} from "@/lib/character/types";
import {
	addLoadoutFeature,
	addLoadoutSet,
	addLoadoutWeakness,
	adjustLoadoutPower,
	decrementWildcards,
	editLoadoutFeature,
	editLoadoutSetTitle,
	editLoadoutWeakness,
	incrementWildcards,
	markLoadoutUpgrade,
	removeLoadoutFeature,
	removeLoadoutSet,
	removeLoadoutWeakness,
	takeLoadoutUpgrade,
	toggleLoadoutFeature,
	toggleLoadoutFeatureBurnt,
	toggleLoadoutSetTitle,
	toggleLoadoutTitleBurnt,
	type UpgradeChoice,
} from "@/lib/loadout-edit";
import { STARTING_THEMES } from "@/lib/rules/constants";
import { essenceCandidates } from "@/lib/rules/essence";

export type CharacterAction =
	| { type: "replace"; document: Character }
	| { type: "rename"; name: string }
	| { type: "setPlayerName"; playerName: string }
	| { type: "setThemeType"; themeId: string; themeType: ThemeType }
	| { type: "setThemebook"; themeId: string; themebook: string }
	| { type: "setThemeQuote"; themeId: string; quote: string }
	| { type: "addThemeSpecial"; themeId: string; special: string }
	| { type: "removeThemeSpecial"; themeId: string; special: string }
	| {
			type: "addPowerTag";
			themeId: string;
			id: string;
			letter: PowerQuestionLetter;
	  }
	| {
			type: "addWeaknessTag";
			themeId: string;
			id: string;
			letter: WeaknessQuestionLetter;
	  }
	| {
			type: "editPowerTag";
			themeId: string;
			tagId: string;
			edit: Partial<Pick<PowerTag, "themebook" | "letter" | "text">>;
	  }
	| {
			type: "editWeaknessTag";
			themeId: string;
			tagId: string;
			edit: Partial<Pick<WeaknessTag, "letter" | "text">>;
	  }
	| { type: "deletePowerTag"; themeId: string; tagId: string }
	| { type: "deleteWeaknessTag"; themeId: string; tagId: string }
	| {
			type: "moveTag";
			themeId: string;
			kind: TagKind;
			tagId: string;
			direction: MoveDirection;
	  }
	| { type: "burnTag"; themeId: string; tagId: string; burnValue: number }
	| { type: "unburnTag"; themeId: string; tagId: string }
	| { type: "markTrack"; themeId: string; track: TrackName }
	| { type: "addTheme"; id: string }
	| {
			type: "loseTheme";
			themeId: string;
			id: string;
			lostAt: string;
			reason: string;
	  }
	| { type: "setEssence"; essence: Essence }
	| { type: "setEssenceSpecial"; essenceSpecial: string }
	| { type: "addLoadoutSet"; id: string }
	| { type: "editLoadoutSetTitle"; setId: string; text: string }
	| { type: "removeLoadoutSet"; setId: string }
	| { type: "toggleLoadoutSetTitle"; setId: string }
	| { type: "toggleLoadoutTitleBurnt"; setId: string }
	| { type: "addLoadoutFeature"; setId: string; id: string }
	| {
			type: "editLoadoutFeature";
			setId: string;
			featureId: string;
			text: string;
	  }
	| { type: "removeLoadoutFeature"; setId: string; featureId: string }
	| { type: "toggleLoadoutFeature"; setId: string; featureId: string }
	| { type: "toggleLoadoutFeatureBurnt"; setId: string; featureId: string }
	| { type: "addLoadoutWeakness"; setId: string; id: string }
	| {
			type: "editLoadoutWeakness";
			setId: string;
			weaknessId: string;
			text: string;
	  }
	| { type: "removeLoadoutWeakness"; setId: string; weaknessId: string }
	| { type: "incrementWildcards" }
	| { type: "decrementWildcards" }
	| { type: "adjustLoadoutPower"; delta: number }
	| { type: "markLoadoutUpgrade" }
	| { type: "takeLoadoutUpgrade"; choice: UpgradeChoice }
	| { type: "addLoadoutSpecial"; special: string }
	| { type: "removeLoadoutSpecial"; special: string }
	| { type: "setCrewMotivation"; motivation: CrewMotivation }
	| { type: "setCrewQuote"; quote: string }
	| { type: "addCrewSpecial"; special: string }
	| { type: "removeCrewSpecial"; special: string }
	| { type: "addCrewPowerTag"; id: string; letter: PowerQuestionLetter }
	| { type: "addCrewWeaknessTag"; id: string; letter: WeaknessQuestionLetter }
	| {
			type: "editCrewPowerTag";
			tagId: string;
			edit: Partial<Pick<PowerTag, "letter" | "text">>;
	  }
	| {
			type: "editCrewWeaknessTag";
			tagId: string;
			edit: Partial<Pick<WeaknessTag, "letter" | "text">>;
	  }
	| { type: "deleteCrewPowerTag"; tagId: string }
	| { type: "deleteCrewWeaknessTag"; tagId: string }
	| {
			type: "moveCrewTag";
			kind: TagKind;
			tagId: string;
			direction: MoveDirection;
	  }
	| { type: "burnCrewTag"; tagId: string; burnValue: number }
	| { type: "unburnCrewTag"; tagId: string }
	| { type: "markCrewTrack"; track: TrackName }
	| { type: "addCrewRelationship"; id: string }
	| {
			type: "editCrewRelationship";
			id: string;
			edit: Partial<Pick<CrewRelationship, "member" | "tag">>;
	  }
	| { type: "removeCrewRelationship"; id: string };

/** Every theme verb below edits one theme and leaves the rest alone. */
function inTheme(
	character: Character,
	themeId: string,
	edit: (theme: Theme) => Theme,
): Character {
	return {
		...character,
		themes: character.themes.map((theme) =>
			theme.id === themeId ? edit(theme) : theme,
		),
	};
}

const withLoadout = (
	character: Character,
	loadout: Partial<Loadout>,
): Character => ({
	...character,
	loadout: { ...character.loadout, ...loadout },
});

const withCrew = (
	character: Character,
	edit: (crew: CrewTheme) => CrewTheme,
): Character => ({
	...character,
	crewTheme: edit(character.crewTheme),
});

function autoEssence(
	character: Pick<Character, "essence" | "essenceChosen">,
	themes: Theme[],
): Essence | "" {
	if (character.essenceChosen) return character.essence;
	if (themes.length < STARTING_THEMES) return "";
	const candidates = essenceCandidates(themes);
	return candidates.length === 1 ? candidates[0] : "";
}

export function reduce(
	character: Character,
	action: CharacterAction,
): Character {
	const { loadout } = character;

	switch (action.type) {
		case "replace":
			return action.document;
		case "rename":
			return { ...character, name: action.name };
		case "setPlayerName":
			return { ...character, playerName: action.playerName };
		case "setThemeType": {
			// A themebook belongs to one type, so a stale choice from the old type
			// would otherwise linger, matching nothing in the new type's list.
			const next = inTheme(character, action.themeId, (theme) => ({
				...theme,
				type: action.themeType,
				themebook: theme.type === action.themeType ? theme.themebook : "",
			}));
			return { ...next, essence: autoEssence(next, next.themes) };
		}
		case "setThemebook":
			return inTheme(character, action.themeId, (theme) => ({
				...theme,
				themebook: action.themebook,
			}));
		case "setThemeQuote":
			return inTheme(character, action.themeId, (theme) => ({
				...theme,
				quote: action.quote,
			}));
		case "addThemeSpecial":
			return inTheme(character, action.themeId, (theme) =>
				theme.specials.includes(action.special)
					? theme
					: { ...theme, specials: [...theme.specials, action.special] },
			);
		case "removeThemeSpecial":
			return inTheme(character, action.themeId, (theme) => ({
				...theme,
				specials: theme.specials.filter(
					(special) => special !== action.special,
				),
			}));
		case "addPowerTag":
			return inTheme(character, action.themeId, (theme) =>
				addPowerTag(theme, action.id, action.letter),
			);
		case "addWeaknessTag":
			return inTheme(character, action.themeId, (theme) =>
				addWeaknessTag(theme, action.id, action.letter),
			);
		case "editPowerTag":
			return inTheme(character, action.themeId, (theme) =>
				editPowerTag(theme, action.tagId, action.edit),
			);
		case "editWeaknessTag":
			return inTheme(character, action.themeId, (theme) =>
				editWeaknessTag(theme, action.tagId, action.edit),
			);
		case "deletePowerTag":
			return inTheme(character, action.themeId, (theme) =>
				deletePowerTag(theme, action.tagId),
			);
		case "deleteWeaknessTag":
			return inTheme(character, action.themeId, (theme) =>
				deleteWeaknessTag(theme, action.tagId),
			);
		case "moveTag":
			return inTheme(character, action.themeId, (theme) =>
				moveTag(theme, action.kind, action.tagId, action.direction),
			);
		case "burnTag":
			return inTheme(character, action.themeId, (theme) =>
				burnTag(theme, action.tagId, action.burnValue),
			);
		case "unburnTag":
			return inTheme(character, action.themeId, (theme) =>
				unburnTag(theme, action.tagId),
			);
		case "markTrack":
			return inTheme(character, action.themeId, (theme) =>
				markTrack(theme, action.track),
			);
		case "addTheme": {
			// No-op past the cap: the button hides at STARTING_THEMES, but this
			// guards a dispatch that outraces the re-render (e.g. a double click).
			if (character.themes.length >= STARTING_THEMES) return character;
			const themes = [...character.themes, newTheme(action.id)];
			return { ...character, themes, essence: autoEssence(character, themes) };
		}
		case "loseTheme": {
			const next = loseTheme(character, action.themeId, {
				id: action.id,
				lostAt: action.lostAt,
				reason: action.reason,
			});
			return { ...next, essence: autoEssence(next, next.themes) };
		}
		case "setEssence": {
			// Picking a candidate the mix already suggests (including breaking a
			// tie) isn't an override, so it stays live; only a pick outside the
			// suggestion freezes essenceChosen.
			const isSuggested = essenceCandidates(character.themes).includes(
				action.essence,
			);
			return {
				...character,
				essence: action.essence,
				essenceChosen: !isSuggested,
			};
		}
		case "setEssenceSpecial":
			return { ...character, essenceSpecial: action.essenceSpecial };
		case "addLoadoutSet":
			return { ...character, loadout: addLoadoutSet(loadout, action.id) };
		case "editLoadoutSetTitle":
			return {
				...character,
				loadout: editLoadoutSetTitle(loadout, action.setId, action.text),
			};
		case "removeLoadoutSet":
			return { ...character, loadout: removeLoadoutSet(loadout, action.setId) };
		case "toggleLoadoutSetTitle":
			return {
				...character,
				loadout: toggleLoadoutSetTitle(loadout, action.setId),
			};
		case "toggleLoadoutTitleBurnt":
			return {
				...character,
				loadout: toggleLoadoutTitleBurnt(loadout, action.setId),
			};
		case "addLoadoutFeature":
			return {
				...character,
				loadout: addLoadoutFeature(loadout, action.setId, action.id),
			};
		case "editLoadoutFeature":
			return {
				...character,
				loadout: editLoadoutFeature(
					loadout,
					action.setId,
					action.featureId,
					action.text,
				),
			};
		case "removeLoadoutFeature":
			return {
				...character,
				loadout: removeLoadoutFeature(loadout, action.setId, action.featureId),
			};
		case "toggleLoadoutFeature":
			return {
				...character,
				loadout: toggleLoadoutFeature(loadout, action.setId, action.featureId),
			};
		case "toggleLoadoutFeatureBurnt":
			return {
				...character,
				loadout: toggleLoadoutFeatureBurnt(
					loadout,
					action.setId,
					action.featureId,
				),
			};
		case "addLoadoutWeakness":
			return {
				...character,
				loadout: addLoadoutWeakness(loadout, action.setId, action.id),
			};
		case "editLoadoutWeakness":
			return {
				...character,
				loadout: editLoadoutWeakness(
					loadout,
					action.setId,
					action.weaknessId,
					action.text,
				),
			};
		case "removeLoadoutWeakness":
			return {
				...character,
				loadout: removeLoadoutWeakness(
					loadout,
					action.setId,
					action.weaknessId,
				),
			};
		case "incrementWildcards":
			return { ...character, loadout: incrementWildcards(loadout) };
		case "decrementWildcards":
			return { ...character, loadout: decrementWildcards(loadout) };
		case "adjustLoadoutPower":
			return {
				...character,
				loadout: adjustLoadoutPower(loadout, action.delta),
			};
		case "markLoadoutUpgrade":
			return { ...character, loadout: markLoadoutUpgrade(loadout) };
		case "takeLoadoutUpgrade":
			return {
				...character,
				loadout: takeLoadoutUpgrade(loadout, action.choice),
			};
		case "addLoadoutSpecial":
			return loadout.specials.includes(action.special)
				? character
				: withLoadout(character, {
						specials: [...loadout.specials, action.special],
					});
		case "removeLoadoutSpecial":
			return withLoadout(character, {
				specials: loadout.specials.filter(
					(special) => special !== action.special,
				),
			});
		case "setCrewMotivation":
			return withCrew(character, (crew) => ({
				...crew,
				motivation: action.motivation,
			}));
		case "setCrewQuote":
			return withCrew(character, (crew) => ({ ...crew, quote: action.quote }));
		case "addCrewSpecial":
			return withCrew(character, (crew) =>
				crew.specials.includes(action.special)
					? crew
					: { ...crew, specials: [...crew.specials, action.special] },
			);
		case "removeCrewSpecial":
			return withCrew(character, (crew) => ({
				...crew,
				specials: crew.specials.filter((special) => special !== action.special),
			}));
		case "addCrewPowerTag":
			return withCrew(character, (crew) =>
				addCrewPowerTag(crew, action.id, action.letter),
			);
		case "addCrewWeaknessTag":
			return withCrew(character, (crew) =>
				addCrewWeaknessTag(crew, action.id, action.letter),
			);
		case "editCrewPowerTag":
			return withCrew(character, (crew) =>
				editCrewPowerTag(crew, action.tagId, action.edit),
			);
		case "editCrewWeaknessTag":
			return withCrew(character, (crew) =>
				editCrewWeaknessTag(crew, action.tagId, action.edit),
			);
		case "deleteCrewPowerTag":
			return withCrew(character, (crew) =>
				deleteCrewPowerTag(crew, action.tagId),
			);
		case "deleteCrewWeaknessTag":
			return withCrew(character, (crew) =>
				deleteCrewWeaknessTag(crew, action.tagId),
			);
		case "moveCrewTag":
			return withCrew(character, (crew) =>
				moveCrewTag(crew, action.kind, action.tagId, action.direction),
			);
		case "burnCrewTag":
			return withCrew(character, (crew) =>
				burnCrewTag(crew, action.tagId, action.burnValue),
			);
		case "unburnCrewTag":
			return withCrew(character, (crew) => unburnCrewTag(crew, action.tagId));
		case "markCrewTrack":
			return withCrew(character, (crew) => markCrewTrack(crew, action.track));
		case "addCrewRelationship":
			return {
				...character,
				crew: [...character.crew, { id: action.id, member: "", tag: "" }],
			};
		case "editCrewRelationship":
			return {
				...character,
				crew: character.crew.map((relationship) =>
					relationship.id === action.id
						? { ...relationship, ...action.edit }
						: relationship,
				),
			};
		case "removeCrewRelationship":
			return {
				...character,
				crew: character.crew.filter(
					(relationship) => relationship.id !== action.id,
				),
			};
	}
}
