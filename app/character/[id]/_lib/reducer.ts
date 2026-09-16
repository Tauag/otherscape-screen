import { loseTheme } from "@/lib/character/loss";
import { newTheme } from "@/lib/character/new";
import { essenceCandidates } from "@/lib/rules/essence";
import {
  addPowerTag,
  addWeaknessTag,
  burnTag,
  deletePowerTag,
  deleteWeaknessTag,
  editPowerTag,
  editWeaknessTag,
  markTrack,
  moveTag,
  unburnTag,
  type MoveDirection,
  type TagKind,
  type TrackName,
} from "@/lib/character/theme";
import type {
  Character,
  Essence,
  Loadout,
  LoadoutTagKind,
  PowerQuestionLetter,
  PowerTag,
  Theme,
  ThemeType,
  WeaknessQuestionLetter,
  WeaknessTag,
} from "@/lib/character/types";
import {
  markLoadoutUpgrade,
  takeLoadoutUpgrade,
  toggleLoadoutTheme,
  type UpgradeChoice,
} from "@/lib/loadout-edit";
import { STARTING_THEMES } from "@/lib/rules/constants";

/**
 * Domain verbs, never generic setters. A new verb is one more case below, so
 * S3 to S7 add burnTag, markUpgrade, raiseStatus and loseTheme here without a
 * refactor. `replace` is the exception: it is how a whole document arrives,
 * from the offline copy on mount or from a resolved conflict.
 */
export type CharacterAction =
  | { type: "replace"; document: Character }
  | { type: "rename"; name: string }
  | { type: "setPlayerName"; playerName: string }
  | { type: "setThemeType"; themeId: string; themeType: ThemeType }
  | { type: "setThemebook"; themeId: string; themebook: string }
  | { type: "setThemeQuote"; themeId: string; quote: string }
  | { type: "addThemeSpecial"; themeId: string; special: string }
  | { type: "removeThemeSpecial"; themeId: string; special: string }
  | { type: "setTitleTag"; themeId: string; tagId: string | null }
  | { type: "addPowerTag"; themeId: string; id: string; letter: PowerQuestionLetter }
  | { type: "addWeaknessTag"; themeId: string; id: string; letter: WeaknessQuestionLetter }
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
  | { type: "loseTheme"; themeId: string; id: string; lostAt: string; reason: string }
  | { type: "setEssence"; essence: Essence }
  | { type: "setEssenceSpecial"; essenceSpecial: string }
  | { type: "toggleLoadoutTheme"; themeId: string }
  | { type: "addLoadoutTag"; id: string; kind: LoadoutTagKind; themeId: string | null }
  | { type: "editLoadoutTag"; id: string; text: string }
  | { type: "removeLoadoutTag"; id: string }
  | { type: "markLoadoutUpgrade"; index: number }
  | { type: "takeLoadoutUpgrade"; choice: UpgradeChoice }
  | { type: "editLoadoutSpecial"; index: number; text: string };

/** Every theme verb below edits one theme and leaves the rest alone. */
function inTheme(character: Character, themeId: string, edit: (theme: Theme) => Theme): Character {
  return {
    ...character,
    themes: character.themes.map((theme) => (theme.id === themeId ? edit(theme) : theme)),
  };
}

const withLoadout = (character: Character, loadout: Partial<Loadout>): Character => ({
  ...character,
  loadout: { ...character.loadout, ...loadout },
});

/**
 * Once the mix narrows to exactly one Essence and the character
 * holds all 4 starting themes, it assigns itself. A tied mix (Avatar or
 * Conduit) or an Essence the player already chose is left alone; the sheet
 * menu's Desired Essence picker covers both.
 */
function autoEssence(current: Essence | "", themes: Theme[]): Essence | "" {
  if (current !== "" || themes.length < STARTING_THEMES) return current;
  const candidates = essenceCandidates(themes);
  return candidates.length === 1 ? candidates[0] : current;
}

export function reduce(character: Character, action: CharacterAction): Character {
  const { loadout } = character;

  switch (action.type) {
    case "replace":
      return action.document;
    case "rename":
      return { ...character, name: action.name };
    case "setPlayerName":
      return { ...character, playerName: action.playerName };
    case "setThemeType":
      return inTheme(character, action.themeId, (theme) => ({ ...theme, type: action.themeType }));
    case "setThemebook":
      return inTheme(character, action.themeId, (theme) => ({
        ...theme,
        themebook: action.themebook,
      }));
    case "setThemeQuote":
      return inTheme(character, action.themeId, (theme) => ({ ...theme, quote: action.quote }));
    case "addThemeSpecial":
      return inTheme(character, action.themeId, (theme) =>
        theme.specials.includes(action.special)
          ? theme
          : { ...theme, specials: [...theme.specials, action.special] },
      );
    case "removeThemeSpecial":
      return inTheme(character, action.themeId, (theme) => ({
        ...theme,
        specials: theme.specials.filter((special) => special !== action.special),
      }));
    case "setTitleTag":
      return inTheme(character, action.themeId, (theme) => ({
        ...theme,
        titleTagId: action.tagId,
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
      return inTheme(character, action.themeId, (theme) => deletePowerTag(theme, action.tagId));
    case "deleteWeaknessTag":
      return inTheme(character, action.themeId, (theme) => deleteWeaknessTag(theme, action.tagId));
    case "moveTag":
      return inTheme(character, action.themeId, (theme) =>
        moveTag(theme, action.kind, action.tagId, action.direction),
      );
    case "burnTag":
      return inTheme(character, action.themeId, (theme) =>
        burnTag(theme, action.tagId, action.burnValue),
      );
    case "unburnTag":
      return inTheme(character, action.themeId, (theme) => unburnTag(theme, action.tagId));
    case "markTrack":
      return inTheme(character, action.themeId, (theme) => markTrack(theme, action.track));
    case "addTheme": {
      // No-op past the cap: the button hides at STARTING_THEMES, but this
      // guards a dispatch that outraces the re-render (e.g. a double click).
      if (character.themes.length >= STARTING_THEMES) return character;
      const themes = [...character.themes, newTheme(action.id)];
      return { ...character, themes, essence: autoEssence(character.essence, themes) };
    }
    case "loseTheme":
      return loseTheme(character, action.themeId, {
        id: action.id,
        lostAt: action.lostAt,
        reason: action.reason,
      });
    case "setEssence":
      return { ...character, essence: action.essence };
    case "setEssenceSpecial":
      return { ...character, essenceSpecial: action.essenceSpecial };
    case "toggleLoadoutTheme":
      return { ...character, loadout: toggleLoadoutTheme(loadout, action.themeId) };
    case "addLoadoutTag":
      return withLoadout(character, {
        tags: [
          ...loadout.tags,
          { id: action.id, kind: action.kind, text: "", themeId: action.themeId },
        ],
      });
    case "editLoadoutTag":
      return withLoadout(character, {
        tags: loadout.tags.map((tag) =>
          tag.id === action.id ? { ...tag, text: action.text } : tag,
        ),
      });
    case "removeLoadoutTag":
      return withLoadout(character, { tags: loadout.tags.filter((tag) => tag.id !== action.id) });
    case "markLoadoutUpgrade":
      return withLoadout(character, { upgrade: markLoadoutUpgrade(loadout.upgrade, action.index) });
    case "takeLoadoutUpgrade":
      return { ...character, loadout: takeLoadoutUpgrade(loadout, action.choice) };
    case "editLoadoutSpecial":
      return withLoadout(character, {
        specials: loadout.specials.map((text, index) =>
          index === action.index ? action.text : text,
        ),
      });
  }
}
