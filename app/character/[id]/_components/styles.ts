// Shared style tokens for the sheet and theme screen's dialogs and buttons.

export const DIALOG_BACKDROP = "fixed inset-0 bg-bg/80";
export const DIALOG_POPUP =
	"fixed inset-0 m-auto h-fit max-h-[85vh] w-[90vw] max-w-[420px] overflow-y-auto rounded-md border border-border bg-surface p-5 text-text";
export const HEADING =
	"font-display text-base font-bold tracking-[0.08em] uppercase";
export const PRIMARY =
	"inline-flex min-h-11 items-center rounded-sm bg-primary px-4 font-display text-sm font-bold tracking-[0.08em] text-bg uppercase";
/** PRIMARY's destructive sibling, for an irreversible action like losing a theme. */
export const DANGER =
	"inline-flex min-h-11 items-center rounded-sm text-danger border border-danger px-4 font-display text-sm font-bold tracking-[0.08em] uppercase";
export const QUIET =
	"inline-flex min-h-11 items-center rounded-sm border border-border px-4 font-display text-sm font-semibold tracking-[0.08em] uppercase";
/** QUIET's compact sibling: a chip-sized outline button for a dense list of rows. */
export const SMALL_BUTTON =
	"inline-flex min-h-11 items-center rounded-sm border border-border px-3 font-display text-xs font-semibold tracking-[0.08em] uppercase";
const FILLED_BASE =
	"inline-flex min-h-11 items-center self-start rounded-sm px-4 font-display text-sm font-bold tracking-[0.08em] text-bg uppercase";
/** An "add" action filled with the surrounding hue (a theme, crew, or loadout
 *  color context), falling back to the app's primary accent where no hue is
 *  set. FILLED_NEGATIVE is its weakness-flavored sibling. */
export const FILLED = `${FILLED_BASE} bg-[var(--hue,var(--color-primary))]`;
export const FILLED_NEGATIVE = `${FILLED_BASE} bg-negative`;
/** A row's own delete action, set off from its sibling by the left border. Add a size (`w-11` in a stretched row, `size-11` in a centered one). */
export const REMOVE_BUTTON =
	"grid shrink-0 place-items-center border-l border-border text-dim";
