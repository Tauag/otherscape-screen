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
  PowerQuestionLetter,
  PowerTag,
  Theme,
  ThemeType,
  WeaknessQuestionLetter,
  WeaknessTag,
} from "@/lib/character/types";

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
  | { type: "setNascent"; themeId: string; nascent: boolean }
  | { type: "setThemeQuote"; themeId: string; quote: string }
  // Free text, so the special itself is the key: T30 stores the pack's
  // "name — text" line and hands the same line back to drop it.
  | { type: "addThemeSpecial"; themeId: string; special: string }
  | { type: "removeThemeSpecial"; themeId: string; special: string }
  | { type: "setTitleTag"; themeId: string; tagId: string | null }
  // The id is minted by the caller, because a reducer runs twice in development
  // and has to return the same document both times.
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
  // The burn value rides on the action, because the dialog takes it per burn.
  | { type: "burnTag"; themeId: string; tagId: string; burnValue: number }
  | { type: "unburnTag"; themeId: string; tagId: string }
  | { type: "markTrack"; themeId: string; track: TrackName; index: number };

/** Every theme verb below edits one theme and leaves the rest alone. */
function inTheme(character: Character, themeId: string, edit: (theme: Theme) => Theme): Character {
  return {
    ...character,
    themes: character.themes.map((theme) => (theme.id === themeId ? edit(theme) : theme)),
  };
}

export function reduce(character: Character, action: CharacterAction): Character {
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
    case "setNascent":
      return inTheme(character, action.themeId, (theme) => ({ ...theme, nascent: action.nascent }));
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
      return inTheme(character, action.themeId, (theme) =>
        markTrack(theme, action.track, action.index),
      );
  }
}
