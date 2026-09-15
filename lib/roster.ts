import type { ThemeType } from "./character/types.ts";

const THEME_TYPES = new Set<ThemeType>(["self", "mythos", "noise"]);

export type RosterTheme = {
  /** Null when the theme has no type yet. Render as --color-pip, never var(--hue). */
  type: ThemeType | null;
  nascent: boolean;
};

export type RosterSummary = {
  themes: RosterTheme[];
  statuses: number;
};

const EMPTY: RosterSummary = { themes: [], statuses: 0 };

/**
 * Parse the `roster_summary` generated column. The row is a trust boundary:
 * it reads `null` on any row written before that column's migration lands,
 * and Postgres, not this code, can hand back an unexpected shape. Never
 * throw here — an unreadable value renders as no bars and no statuses line.
 */
export function parseRosterSummary(value: unknown): RosterSummary {
  if (typeof value !== "object" || value === null) return EMPTY;
  const row = value as Record<string, unknown>;

  const themes: RosterTheme[] = Array.isArray(row.themes)
    ? row.themes.flatMap((entry): RosterTheme[] => {
        if (typeof entry !== "object" || entry === null) return [];
        const record = entry as Record<string, unknown>;
        const type = typeof record.type === "string" && THEME_TYPES.has(record.type as ThemeType)
          ? (record.type as ThemeType)
          : null;
        return [{ type, nascent: record.nascent === true }];
      })
    : [];

  const statuses = Number.isInteger(row.statuses) && (row.statuses as number) >= 0 ? (row.statuses as number) : 0;

  return { themes, statuses };
}
