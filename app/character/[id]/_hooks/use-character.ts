"use client";

import { useContext } from "react";
import { CharacterContext } from "../_components/character-provider";

export function useCharacter() {
	const value = useContext(CharacterContext);
	if (!value)
		throw new Error("useCharacter needs a CharacterProvider above it.");
	return value;
}
