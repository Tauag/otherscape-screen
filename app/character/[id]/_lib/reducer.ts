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
	toggleBroadTag,
	unburnTag,
} from "@/lib/character/theme";
import type {
	Character,
	CrewMotivation,
	CrewRelationship,
	CrewTheme,
	Essence,
	Evolutions,
	Loadout,
	PowerQuestionLetter,
	PowerTag,
	Status,
	StoryTag,
	Theme,
	ThemeType,
	Valence,
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
	unloadAllLoadout,
} from "@/lib/loadout-edit";
import {
	DEFAULT_BURN_VALUE,
	DEFAULT_STATUS_LIMIT,
	EVOLUTION_POINTS_TRACK_LENGTH,
	STARTING_THEMES,
	VETERAN_SPECIALS_MOMENT_LENGTH,
} from "@/lib/rules/constants";
import { essenceCandidates } from "@/lib/rules/essence";
import {
	clearStatusTier,
	lowerStatus,
	raiseStatus,
	resizeStatusLimit,
} from "@/lib/rules/status";

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
	| { type: "toggleBroadTag"; themeId: string; tagId: string }
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
	| { type: "markEvolutionPoints" }
	| {
			type: "toggleEvolutionMoment";
			moment: Exclude<keyof Evolutions, "veteranSpecials">;
	  }
	| { type: "markVeteranSpecialsMoment" }
	| { type: "addVeteranSpecial"; special: string }
	| { type: "removeVeteranSpecial"; special: string }
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
	| { type: "unloadAllLoadout" }
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
	| { type: "removeCrewRelationship"; id: string }
	| { type: "burnCrewRelationship"; id: string }
	| { type: "unburnCrewRelationship"; id: string }
	| { type: "addStatus"; id: string; valence: Valence }
	| { type: "renameStatus"; id: string; name: string }
	| { type: "raiseStatus"; id: string }
	| { type: "lowerStatus"; id: string }
	| { type: "markStatusTier"; id: string; tier: number }
	| { type: "clearStatusTier"; id: string; tier: number }
	| { type: "setStatusLimit"; id: string; limit: number }
	| { type: "setStatusValence"; id: string; valence: Valence }
	| { type: "removeStatus"; id: string }
	| { type: "addStoryTag"; id: string; valence: Valence }
	| { type: "renameStoryTag"; id: string; name: string }
	| { type: "setStoryTagValence"; id: string; valence: Valence }
	| { type: "burnStoryTag"; id: string; burnValue: number }
	| { type: "unburnStoryTag"; id: string }
	| { type: "toggleStoryTagCrispy"; id: string }
	| { type: "removeStoryTag"; id: string };

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

const inStatus = (
	character: Character,
	id: string,
	edit: (status: Status) => Status,
): Character => ({
	...character,
	statuses: character.statuses.map((status) =>
		status.id === id ? edit(status) : status,
	),
});

const inStoryTag = (
	character: Character,
	id: string,
	edit: (tag: StoryTag) => StoryTag,
): Character => ({
	...character,
	storyTags: character.storyTags.map((tag) =>
		tag.id === id ? edit(tag) : tag,
	),
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
		case "toggleBroadTag":
			return inTheme(character, action.themeId, (theme) =>
				toggleBroadTag(theme, action.tagId),
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
		case "markEvolutionPoints":
			return {
				...character,
				evolutionPoints:
					character.evolutionPoints >= EVOLUTION_POINTS_TRACK_LENGTH
						? 0
						: ((character.evolutionPoints + 1) as Character["evolutionPoints"]),
			};
		case "toggleEvolutionMoment":
			return {
				...character,
				evolutions: {
					...character.evolutions,
					[action.moment]: !character.evolutions[action.moment],
				},
			};
		case "markVeteranSpecialsMoment": {
			const { veteranSpecials } = character.evolutions;
			const next =
				veteranSpecials >= VETERAN_SPECIALS_MOMENT_LENGTH
					? 0
					: ((veteranSpecials + 1) as Evolutions["veteranSpecials"]);
			return {
				...character,
				evolutions: { ...character.evolutions, veteranSpecials: next },
			};
		}
		case "addVeteranSpecial":
			return character.veteranSpecials.includes(action.special)
				? character
				: {
						...character,
						veteranSpecials: [...character.veteranSpecials, action.special],
					};
		case "removeVeteranSpecial":
			return {
				...character,
				veteranSpecials: character.veteranSpecials.filter(
					(special) => special !== action.special,
				),
			};
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
		case "unloadAllLoadout":
			return { ...character, loadout: unloadAllLoadout(loadout) };
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
				crew: [
					...character.crew,
					{ id: action.id, member: "", tag: "", burnt: false },
				],
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
		case "burnCrewRelationship":
			return {
				...character,
				crew: character.crew.map((relationship) =>
					relationship.id === action.id
						? { ...relationship, burnt: true }
						: relationship,
				),
			};
		case "unburnCrewRelationship":
			return {
				...character,
				crew: character.crew.map((relationship) =>
					relationship.id === action.id
						? { ...relationship, burnt: false }
						: relationship,
				),
			};
		case "addStatus":
			return {
				...character,
				statuses: [
					...character.statuses,
					{
						id: action.id,
						name: "",
						valence: action.valence,
						tiers: resizeStatusLimit([true], DEFAULT_STATUS_LIMIT),
						limit: DEFAULT_STATUS_LIMIT,
					},
				],
			};
		case "renameStatus":
			// The rulebook's shorthand is always lowercase kebab-case (exhausted-2,
			// amped-up-2), so a status name is normalized as it's typed.
			return inStatus(character, action.id, (status) => ({
				...status,
				name: action.name.toLowerCase().replaceAll(" ", "-"),
			}));
		case "raiseStatus":
			return inStatus(character, action.id, (status) => ({
				...status,
				tiers: raiseStatus(
					status.tiers,
					Math.max(1, status.tiers.lastIndexOf(true) + 1),
					status.limit,
				),
			}));
		case "lowerStatus": {
			const lowered = character.statuses.map((status) =>
				status.id === action.id
					? { ...status, tiers: lowerStatus(status.tiers, 1) }
					: status,
			);
			return {
				...character,
				statuses: lowered.filter(
					(status) => status.id !== action.id || status.tiers.some(Boolean),
				),
			};
		}
		case "markStatusTier":
			return inStatus(character, action.id, (status) => ({
				...status,
				tiers: raiseStatus(status.tiers, action.tier, status.limit),
			}));
		case "clearStatusTier":
			return inStatus(character, action.id, (status) => ({
				...status,
				tiers: clearStatusTier(status.tiers, action.tier),
			}));
		case "setStatusLimit": {
			if (!Number.isInteger(action.limit) || action.limit < 1) {
				throw new Error(
					`Status limit must be a positive integer (got ${action.limit}).`,
				);
			}
			return inStatus(character, action.id, (status) => ({
				...status,
				tiers: resizeStatusLimit(status.tiers, action.limit),
				limit: action.limit,
			}));
		}
		case "setStatusValence":
			return inStatus(character, action.id, (status) => ({
				...status,
				valence: action.valence,
			}));
		case "removeStatus":
			return {
				...character,
				statuses: character.statuses.filter(
					(status) => status.id !== action.id,
				),
			};
		case "addStoryTag":
			return {
				...character,
				storyTags: [
					...character.storyTags,
					{
						id: action.id,
						name: "",
						valence: action.valence,
						burnt: false,
						crispy: false,
					},
				],
			};
		case "renameStoryTag":
			return inStoryTag(character, action.id, (tag) => ({
				...tag,
				name: action.name,
			}));
		case "setStoryTagValence":
			return inStoryTag(character, action.id, (tag) => ({
				...tag,
				valence: action.valence,
			}));
		case "burnStoryTag":
			// A crispy tag is one-time and never burns; a negative tag doesn't
			// either, same as a weakness tag never does.
			return inStoryTag(character, action.id, (tag) => {
				if (tag.crispy || tag.valence === "negative") return tag;
				const next: StoryTag = {
					...tag,
					burnt: true,
					burnValue: action.burnValue,
				};
				// theme.ts's PowerTag does the same: an untouched default stays
				// absent, so a later change to DEFAULT_BURN_VALUE still reaches it.
				if (action.burnValue === DEFAULT_BURN_VALUE) delete next.burnValue;
				return next;
			});
		case "unburnStoryTag":
			return inStoryTag(character, action.id, (tag) => {
				const next = { ...tag, burnt: false };
				delete next.burnValue;
				return next;
			});
		case "toggleStoryTagCrispy":
			return inStoryTag(character, action.id, (tag) => {
				if (tag.crispy) return { ...tag, crispy: false };
				// Crispy and burnt can't both hold: going crispy un-burns it.
				const next = { ...tag, crispy: true, burnt: false };
				delete next.burnValue;
				return next;
			});
		case "removeStoryTag":
			return {
				...character,
				storyTags: character.storyTags.filter((tag) => tag.id !== action.id),
			};
	}
}
