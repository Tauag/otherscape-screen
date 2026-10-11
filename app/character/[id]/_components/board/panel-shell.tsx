"use client";

import Link from "next/link";
import { EditIcon } from "@/app/character/[id]/_components/icons";
import type {
	RollGroup,
	RollTag,
} from "@/app/character/[id]/_lib/roll-selection";

/** The shell every board panel shares: card chrome, header label, tag list,
 *  and edit link. Composition only, over the same leaf components the phone
 *  routes use (design.md 5, decision 4); the quote and specials lines come
 *  from components/card-parts.tsx. */

export type TagChip = (tag: RollTag, hue?: RollGroup["hue"]) => React.ReactNode;

export const HEADER_LABEL =
	"font-display text-[10px] font-semibold tracking-[0.17em] text-dim uppercase";
export const SHELL =
	"notched [--bt:3px] flex min-h-[15.25rem] flex-col gap-2 tall:overflow-y-auto border border-border border-t-[3px] border-t-[var(--hue)] bg-surface px-3 pt-[11px] pb-3";
export const EMPTY_SHELL =
	"notched [--bt:3px] flex flex-col gap-2 overflow-hidden border border-dashed border-raised border-t-[3px] border-t-[var(--hue)]/35 bg-recess px-3 pt-[11px] pb-3";

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
