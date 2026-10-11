// Style tokens shared by every route: the sheet, the share view, the roster,
// and admin.

export const LABEL =
	"font-mono text-[10px] tracking-[0.08em] text-faint uppercase";

export const CARD =
	"notched flex overflow-hidden border border-border bg-surface";
export const CARD_STRIPE = "w-[3px] shrink-0 bg-[var(--hue)]";
export const CARD_BODY =
	"flex min-w-0 flex-1 flex-col gap-[9px] px-3 pt-[11px] pb-2.5";

export const MENU_POPUP =
	"min-w-[190px] rounded-md border border-border bg-surface p-1 text-text shadow-lg outline-none";
export const MENU_ITEM =
	"flex min-h-11 cursor-pointer items-center rounded-sm px-3 font-display text-sm font-semibold tracking-[0.08em] uppercase outline-none select-none data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary";

/** ConfirmDialog's shell: backdrop, popup, and its title and quiet-close button. */
export const DIALOG_BACKDROP = "fixed inset-0 bg-bg/80";
export const DIALOG_POPUP =
	"fixed inset-0 m-auto h-fit max-h-[85vh] w-[90vw] max-w-[420px] overflow-y-auto rounded-md border border-border bg-surface p-5 text-text";
export const HEADING =
	"font-display text-base font-bold tracking-[0.08em] uppercase";
export const QUIET =
	"inline-flex min-h-11 items-center rounded-sm border border-border px-4 font-display text-sm font-semibold tracking-[0.08em] uppercase";

export const PRIMARY =
	"inline-flex min-h-11 items-center rounded-sm bg-primary px-4 font-display text-sm font-bold tracking-[0.08em] text-bg uppercase";
/** PRIMARY's destructive sibling, for an irreversible action like losing a theme. */
export const DANGER =
	"inline-flex min-h-11 items-center rounded-sm text-danger border border-danger px-4 font-display text-sm font-bold tracking-[0.08em] uppercase";
/** DANGER, filled: the confirming button inside a delete or lose dialog. */
export const DANGER_FILLED =
	"inline-flex min-h-11 items-center rounded-sm bg-danger px-4 font-display text-sm font-bold tracking-[0.08em] text-bg uppercase";
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
