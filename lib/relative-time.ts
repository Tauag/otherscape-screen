// Intl.RelativeTimeFormat is in the platform, so no date library.
const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

// Each entry is the unit and how many of it make the next one up.
const divisions: [Intl.RelativeTimeFormatUnit, number][] = [
  ["second", 60],
  ["minute", 60],
  ["hour", 24],
  ["day", 7],
  ["week", 4.34524],
  ["month", 12],
  ["year", Infinity],
];

/**
 * "2 minutes ago", "6 days ago", "in 10 minutes". Pass `now` to make it pure.
 *
 * lazy: weeks per month is the average, so a "4 weeks ago" boundary can land a
 * day early. Upgrade path: a calendar-aware difference, which needs the
 * viewer's time zone.
 */
export function relativeTime(when: string | number | Date, now: Date = new Date()): string {
  let delta = (new Date(when).getTime() - now.getTime()) / 1000;

  for (const [unit, perNext] of divisions) {
    if (Math.abs(delta) < perNext) return formatter.format(Math.round(delta), unit);
    delta /= perNext;
  }

  return formatter.format(Math.round(delta), "year");
}
