// Style tokens shared by both the sheet (/character) and the read-only
// share view (/s).

export const LABEL =
	"font-mono text-[10px] tracking-[0.08em] text-faint uppercase";

export const CARD =
	"flex overflow-hidden rounded-md border border-border bg-surface";
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
