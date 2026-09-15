import type { Character } from "@/lib/character/types";

export type CharacterAction =
  | { type: "replace"; document: Character }
  | { type: "rename"; name: string }
  | { type: "setPlayerName"; playerName: string };

export function reduce(character: Character, action: CharacterAction): Character {
  switch (action.type) {
    case "replace":
      return action.document;
    case "rename":
      return { ...character, name: action.name };
    case "setPlayerName":
      return { ...character, playerName: action.playerName };
  }
}
