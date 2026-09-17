"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { NO_PICK, type RollPick } from "../_lib/roll-selection";

const RollSelectionContext = createContext<{
	pick: RollPick;
	setPick: React.Dispatch<React.SetStateAction<RollPick>>;
} | null>(null);

/**
 * The roll in front of the player: the tags and statuses tapped, the modifier,
 * the theme type rolled with, and any per-roll burn value. It sits on the
 * character layout so it survives a trip to /play and back.
 *
 * Throwaway on purpose. Nothing here is written to localStorage, dispatched
 * into the character reducer, or saved to Supabase; it dies with the page load.
 *
 * lazy: one `useState` for the whole selection, so every tap re-renders the
 * character tree. The ceiling is a large sheet dropping frames on each tap; the
 * upgrade path is to split this provider or memoize the subtree.
 */
export function RollSelectionProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [pick, setPick] = useState<RollPick>(NO_PICK);
	const value = useMemo(() => ({ pick, setPick }), [pick]);

	return (
		<RollSelectionContext.Provider value={value}>
			{children}
		</RollSelectionContext.Provider>
	);
}

export function useRollSelection() {
	const value = useContext(RollSelectionContext);
	if (!value)
		throw new Error("useRollSelection needs a RollSelectionProvider above it.");
	return value;
}
