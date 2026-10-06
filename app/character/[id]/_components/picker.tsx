"use client";

import { Button } from "@base-ui/react/button";
import { Toggle } from "@base-ui/react/toggle";
import Link from "next/link";
import { LABEL, QUIET } from "@/components/styles";
import type { ThemeType } from "@/lib/character/types";
import { type Question, questionLabel, type Special } from "@/lib/content/pack";
import { answerCounts, formatSpecial } from "@/lib/pickers";

export const PAGE =
	"mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-5 pt-3 pb-8";
export const ROW =
	"flex min-h-11 w-full flex-col justify-center gap-0.5 rounded-sm border border-border bg-surface px-3 py-2 text-left aria-pressed:border-[var(--hue)]";
export const ROW_TEXT = "font-sans text-[13px] text-dim";

export function PickerFrame({
	type,
	title,
	wide = false,
	children,
}: {
	type?: ThemeType | "loadout";
	title: string;
	/** At lg, widen past the phone column for a picker laid out as a grid. */
	wide?: boolean;
	children: React.ReactNode;
}) {
	return (
		<main
			data-type={type}
			className={`${PAGE} ${wide ? "lg:max-w-5xl lg:gap-5 lg:px-8 lg:pt-6" : ""}`}
		>
			<h1 className="font-display text-[26px] leading-tight font-bold tracking-[0.05em] text-[var(--hue-title,var(--color-text))] uppercase">
				{title}
			</h1>

			{children}
		</main>
	);
}

/** What a picker shows when its theme or tag went while it was open: another
 *  device can delete one. */
export function Missing({
	href,
	label,
	sentence,
}: {
	href: string;
	label: string;
	sentence: string;
}) {
	return (
		<main className={PAGE}>
			<p className="font-sans text-base text-dim">{sentence}</p>
			<Link href={href} className={`${QUIET} self-start`}>
				{label}
			</Link>
		</main>
	);
}

/** A tag's question choices, each with how many of `tags` already answer it. */
export function QuestionList<L extends string>({
	kind,
	questions,
	tags,
	onPick,
}: {
	kind: "power" | "weakness";
	questions: Question<L>[];
	tags: readonly { letter: string }[];
	onPick: (letter: L) => void;
}) {
	const counts = answerCounts(tags);

	return (
		<ul className="flex flex-col gap-2">
			{questions.map(({ letter, text }) => {
				const count = counts[letter] ?? 0;
				return (
					<li key={letter}>
						<Button
							type="button"
							onClick={() => onPick(letter)}
							className={ROW}
						>
							<span className="flex items-baseline gap-2">
								<span className="font-mono text-[13px] text-[var(--hue)]">
									{letter}
								</span>
								<span className={ROW_TEXT}>
									{text || questionLabel(kind, letter)}
								</span>
							</span>
							{count > 0 && (
								<span className={LABEL}>
									Already answered by {count} {count === 1 ? "tag" : "tags"}
								</span>
							)}
						</Button>
					</li>
				);
			})}
		</ul>
	);
}

const SPECIAL_CARD =
	"flex h-full w-full flex-col gap-1.5 rounded-md border border-border bg-surface px-4 py-3 text-left transition-colors hover:border-[var(--hue)]/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-pressed:border-[var(--hue)] aria-pressed:bg-[var(--hue)]/7";

export function SpecialGrid({
	specials,
	taken,
	onToggle,
	slot,
}: {
	specials: Special[];
	/** The stored specials, as `formatSpecial` writes them. */
	taken: string[];
	onToggle: (special: string) => void;
	/** Names an empty slot: "Theme special" reads "Theme special 3". */
	slot: string;
}) {
	return (
		<ul className="grid gap-2 lg:grid-cols-2 lg:gap-3 xl:grid-cols-3">
			{specials.map((special, index) => {
				const stored = formatSpecial(special);

				// An empty pack slot stays visible: there is nothing to store yet, so
				// the slot is a line rather than a choice.
				if (stored === "") {
					return (
						// biome-ignore lint/suspicious/noArrayIndexKey: an unloaded pack fills every slot with the same blank special, so index is what the label reads.
						<li key={index} className={`${ROW} border-dashed`}>
							<span className={ROW_TEXT}>
								{slot} {index + 1}. The content pack has not been uploaded.
							</span>
						</li>
					);
				}

				const isTaken = taken.includes(stored);
				return (
					// biome-ignore lint/suspicious/noArrayIndexKey: specials come from a fixed content-pack list that is never reordered.
					<li key={index}>
						<Toggle
							pressed={isTaken}
							onPressedChange={() => onToggle(stored)}
							className={SPECIAL_CARD}
						>
							<span className="flex items-baseline justify-between gap-3">
								<span className="font-display text-[15px] font-semibold tracking-[0.03em] text-[var(--hue-title)] uppercase">
									{special.name}
								</span>
								{isTaken && (
									<span className="shrink-0 font-mono text-[9px] font-bold tracking-[0.14em] text-[var(--hue)] uppercase">
										Taken ✓
									</span>
								)}
							</span>
							<span className="font-sans text-sm leading-relaxed text-dim">
								{special.text}
							</span>
						</Toggle>
					</li>
				);
			})}
		</ul>
	);
}
