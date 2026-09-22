"use client";

import { useSyncExternalStore } from "react";

function subscribe(query: string, onChange: () => void) {
	const mql = window.matchMedia(query);
	mql.addEventListener("change", onChange);
	return () => mql.removeEventListener("change", onChange);
}

/**
 * Reads a media query, hydrating from a fixed `serverSnapshot` so the first
 * client render matches the server instead of flashing. The desktop board
 * relies on this: the server always renders the phone tree, and this hook
 * swaps it for the board after hydration reads the real viewport.
 */
export function useMediaQuery(query: string, serverSnapshot: boolean): boolean {
	return useSyncExternalStore(
		(onChange) => subscribe(query, onChange),
		() => window.matchMedia(query).matches,
		() => serverSnapshot,
	);
}
