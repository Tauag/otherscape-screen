"use client";

import Link from "next/link";
import type { ThemeType } from "@/lib/character/types";

export const PAGE =
	"mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-5 pt-3 pb-8";
export const ROW =
	"flex min-h-11 w-full flex-col justify-center gap-0.5 rounded-sm border border-border bg-surface px-3 py-2 text-left aria-pressed:border-[var(--hue)]";
export const ROW_TEXT = "font-sans text-[13px] text-dim";

/**
 * data-type sits on the root, so every row below reads the theme's hue off
 * the cascade. `type` is a theme picker's own; the loadout specials picker
 * leaves it out and every `--hue*` var falls back to the neutral text color.
 */
export function PickerFrame({
	backHref,
	backLabel,
	type,
	title,
	children,
}: {
	backHref: string;
	backLabel: string;
	type?: ThemeType;
	title: string;
	children: React.ReactNode;
}) {
	return (
		<main data-type={type} className={PAGE}>
			<Link
				href={backHref}
				className="-mb-2 inline-flex min-h-11 items-center gap-1.5 font-mono text-[10px] tracking-[0.08em] text-dim uppercase"
			>
				<span aria-hidden>←</span>
				{backLabel}
			</Link>

			<h1 className="font-display text-[26px] leading-tight font-bold tracking-[0.05em] text-[var(--hue-title,var(--color-text))] uppercase">
				{title}
			</h1>

			{children}
		</main>
	);
}
