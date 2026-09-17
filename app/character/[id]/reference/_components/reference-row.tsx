import type { Row } from "@/app/character/[id]/reference/_lib/sections";

/** A slot the content pack has not filled: visible, and plainly blank. */
const SLOT =
	"rounded-sm border border-dashed border-pip font-mono text-[10px] tracking-[0.08em] text-faint uppercase";

/**
 * One cheatsheet line: the name, what it costs, and its rule text. Read-only,
 * and flat rather than an accordion, because a collapsed row would hide the
 * empty slots this screen exists to show (design.md, interface decision 5).
 *
 * lazy: no expand and collapse. The ceiling is a filled pack, where every rule
 * sentence at once makes a long scroll; the upgrade path is the Base UI
 * `Accordion` that `_components/special-card.tsx` already uses.
 */
export function ReferenceRow({ row }: { row: Row }) {
	return (
		<li className="flex flex-col gap-2 rounded-sm border border-border bg-surface px-3 py-2.5">
			<div className="flex items-center justify-between gap-2">
				<span className="font-display text-[15px] font-semibold tracking-[0.06em] text-text uppercase">
					{row.name}
				</span>

				{row.cost !== undefined &&
					(row.cost === "" ? (
						<span className={`${SLOT} px-2 py-1`}>cost slot</span>
					) : (
						<span className="font-mono text-xs tracking-[0.08em] text-primary">
							{row.cost}
						</span>
					))}
			</div>

			{row.text === "" ? (
				<p className={`${SLOT} min-h-11 content-center px-3 py-2`}>rule slot</p>
			) : (
				<p className="font-sans text-[13px] text-dim">{row.text}</p>
			)}
		</li>
	);
}
