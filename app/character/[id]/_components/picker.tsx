"use client";

import type { ThemeType } from "@/lib/character/types";

export const PAGE =
	"mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-5 pt-3 pb-8";
export const ROW =
	"flex min-h-11 w-full flex-col justify-center gap-0.5 rounded-sm border border-border bg-surface px-3 py-2 text-left aria-pressed:border-[var(--hue)]";
export const ROW_TEXT = "font-sans text-[13px] text-dim";

export function PickerFrame({
	type,
	title,
	children,
}: {
	type?: ThemeType | "crew";
	title: string;
	children: React.ReactNode;
}) {
	return (
		<main data-type={type} className={PAGE}>
			<h1 className="font-display text-[26px] leading-tight font-bold tracking-[0.05em] text-[var(--hue-title,var(--color-text))] uppercase">
				{title}
			</h1>

			{children}
		</main>
	);
}
