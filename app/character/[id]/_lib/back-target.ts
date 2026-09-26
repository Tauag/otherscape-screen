/** Folder segments that route to a child id rather than a page of their own
 *  (e.g. `crew/tag/[tagId]`, `theme/[tid]/tag/[tagId]`) — a back link must
 *  skip past them too, or it lands on a route with no page.tsx. */
const CONNECTOR_SEGMENTS = new Set(["tag", "theme"]);

/** Where a character subpage's back arrow points: one level up the route
 *  hierarchy, never `router.back()`'s free-form history (which a deep link,
 *  reload, or cross-page navigation can leave empty or wrong). The board
 *  itself (`/character/[id]`) is the section's root, so it goes to the
 *  roster instead. */
export function backTarget(pathname: string, id: string): string {
	if (pathname === `/character/${id}`) return "/";

	const segments = pathname.split("/").filter(Boolean);
	segments.pop();
	while (
		segments.length > 2 &&
		CONNECTOR_SEGMENTS.has(segments[segments.length - 1])
	) {
		segments.pop();
	}
	return `/${segments.join("/")}`;
}
