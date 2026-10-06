import type { CrewMotivation, ThemeType } from "./types.ts";

/** The `themeId` a theme action takes to edit the crew theme instead of a
 *  theme. Theme ids are UUIDs, so this never collides with one. */
export const CREW_THEME_ID = "crew";

/** Identity is the Self line, Ritual is Mythos, Itch is Noise, on every themebook. A crew takes the hue of its line. */
export const MOTIVATION_TYPE: Record<CrewMotivation, ThemeType> = {
	Identity: "self",
	Ritual: "mythos",
	Itch: "noise",
};
