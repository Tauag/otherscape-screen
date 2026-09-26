"use client";

import Link from "next/link";
import { EditIcon } from "@/app/character/[id]/_components/icons";
import type {
	RollGroup,
	RollTag,
} from "@/app/character/[id]/_lib/roll-selection";
import { specialName, specialText } from "@/lib/pickers";
import { SpecialTooltip } from "@/components/special-tooltip";

/** The shell every board panel shares: card chrome, header label, tag list,
 *  edit link, and quote line. Composition only, over the same leaf components
 *  the phone routes use (design.md 5, decision 4). */

export type TagChip = (tag: RollTag, hue?: string) => React.ReactNode;

export const HEADER_LABEL =
	"font-display text-[10px] font-semibold tracking-[0.17em] text-dim uppercase";
export const SHELL =
	"flex min-h-[17.5rem] flex-col gap-2 overflow-y-auto rounded-md border border-border border-t-[3px] border-t-[var(--hue)] bg-surface px-3 pt-[11px] pb-3";
export const EMPTY_SHELL =
	"flex flex-col gap-2 overflow-hidden rounded-md border border-dashed border-raised border-t-[3px] border-t-[var(--hue)]/35 bg-recess px-3 pt-[11px] pb-3";
export const NASCENT_BADGE =
	"border border-pip px-[5px] py-0.5 font-mono text-[8px] font-bold tracking-[0.1em] text-dim";

export function TagList({
	group,
	tagChip,
}: {
	group: RollGroup;
	tagChip: TagChip;
}) {
	return (
		<ul className="flex flex-col gap-1.5">
			{group.tags.map((tag) => tagChip(tag, group.hue))}
		</ul>
	);
}

export function EditLink({ href, label }: { href: string; label: string }) {
	return (
		<Link
			href={href}
			aria-label={label}
			className="grid size-7 shrink-0 place-items-center text-faint"
		>
			<EditIcon />
		</Link>
	);
}

export function SpecialsList({ specials }: { specials: string[] }) {
	if (specials.length === 0) return null;

	return (
		<ul className="flex flex-col gap-1">
			{specials.map((special) => (
				<li key={special} className="flex items-baseline gap-[7px]">
					<span className="shrink-0 font-mono text-[8px] font-bold tracking-[0.14em] text-[var(--hue)]/80 uppercase">
						Special
					</span>
					<SpecialTooltip text={specialText(special)}>
						<span className="font-sans text-[13px] text-[var(--hue-text)]">
							{specialName(special)}
						</span>
					</SpecialTooltip>
				</li>
			))}
		</ul>
	);
}

/** A theme or crew panel's flavor line: the mystery/identity/motivation label
 *  set against the quote it belongs to. */
export function PanelQuote({ label, quote }: { label: string; quote: string }) {
	if (!quote.trim()) return null;

	return (
		<div className="flex items-baseline gap-[7px] pt-0.5">
			<span className="shrink-0 font-mono text-[8px] font-bold tracking-[0.14em] text-faint uppercase">
				{label}
			</span>
			<span className="font-sans text-[12.5px] text-quiet italic">{quote}</span>
		</div>
	);
}
