"use client";

import { Button } from "@base-ui/react/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useRollSelection } from "@/app/character/[id]/_components/roll-selection";
import {
	type RollTag,
	rollGroups,
	rollOrder,
	rollStatuses,
	signed,
	toRollSelection,
} from "@/app/character/[id]/_lib/roll-selection";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { BurnOverride } from "@/app/character/[id]/roll/_components/burn-override";
import { RollChip } from "@/app/character/[id]/roll/_components/roll-chip";
import { RollControls } from "@/app/character/[id]/roll/_components/roll-controls";
import { RollTotal } from "@/app/character/[id]/roll/_components/roll-total";
import { LABEL } from "@/components/styles";
import { DEFAULT_BURN_VALUE } from "@/lib/rules/constants";
import { power } from "@/lib/rules/power";

export default function RollPage() {
	const router = useRouter();
	const { character } = useCharacter();
	const { pick, setPick } = useRollSelection();
	const [overriding, setOverriding] = useState<RollTag | null>(null);

	const selection = toRollSelection(character, pick);
	const breakdown = power(selection);

	// `power()` lines its tags up in the order the projection feeds them, after
	// the rollWith line. Zipping them here keeps one call the source of every
	// value on screen, chips and total alike.
	const offset = selection.rollWith ? 1 : 0;
	const lineOf = new Map(
		rollOrder(character, pick).map((id, index) => [
			id,
			breakdown.lines[index + offset],
		]),
	);

	const toggle = (id: string) =>
		setPick((current) => ({
			...current,
			ids: current.ids.includes(id)
				? current.ids.filter((one) => one !== id)
				: [...current.ids, id],
		}));

	const burnValueOfPick = (tag: RollTag) =>
		tag.burnValue === null ? null : (pick.burnValues[tag.id] ?? tag.burnValue);

	const tagChip = (tag: RollTag, hue?: string) => {
		const line = lineOf.get(tag.id);
		const burnt = burnValueOfPick(tag) !== null;
		return (
			<RollChip
				key={tag.id}
				text={tag.text}
				type={tag.valence === "positive" ? (hue as never) : undefined}
				valence={tag.valence === "negative" ? "negative" : undefined}
				burnt={burnt}
				selected={line !== undefined}
				counted={line?.counted ?? false}
				value={line && signed(line.value)}
				badge={burnt ? "BURNT" : undefined}
				onToggle={() => toggle(tag.id)}
				onValueClick={line && burnt ? () => setOverriding(tag) : undefined}
			/>
		);
	};

	return (
		<main className="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col">
			<div className="flex shrink-0 items-center gap-2.5 border-b border-edge px-5 py-2">
				<div className="flex flex-1 flex-col gap-[3px]">
					<h1 className="font-display text-[15px] font-bold tracking-[0.14em] text-text uppercase">
						Build roll
					</h1>
					<p className="font-sans text-[11px] text-muted">
						Pick everything that applies. Effects get chosen after.
					</p>
				</div>

				<Button
					type="button"
					onClick={() => router.back()}
					aria-label="Close the roll builder"
					className="-mr-2.5 grid size-11 shrink-0 place-items-center text-muted"
				>
					<svg
						aria-hidden="true"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.8"
						strokeLinecap="round"
					>
						<path d="M6 6l12 12M18 6L6 18" />
					</svg>
				</Button>
			</div>

			<div className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-5 py-3.5">
				{rollGroups(character).map((group) => {
					const subtotal = group.tags.reduce((sum, tag) => {
						const line = lineOf.get(tag.id);
						return line?.counted ? sum + line.value : sum;
					}, 0);

					return (
						<section
							key={group.id}
							data-type={group.hue}
							className="flex flex-col gap-2"
						>
							<div className="flex items-baseline justify-between gap-2">
								<h2 className={LABEL}>{group.label}</h2>
								<p className="font-mono text-[11px] font-bold text-[var(--hue)]">
									{signed(subtotal)}
								</p>
							</div>
							<ul className="flex flex-wrap gap-1.5">
								{group.tags.map((tag) => tagChip(tag, group.hue))}
							</ul>
						</section>
					);
				})}

				<section className="flex flex-col gap-2">
					<div className="flex items-baseline justify-between gap-2">
						<h2 className={LABEL}>Statuses</h2>
						<p className="font-mono text-[9px] tracking-[0.06em] text-faint uppercase">
							Highest tier each side counts
						</p>
					</div>
					{rollStatuses(character).length === 0 ? (
						<p className="font-sans text-sm text-dim">Nothing on the table.</p>
					) : (
						<ul className="flex flex-wrap gap-1.5">
							{rollStatuses(character).map((status) => {
								const line = lineOf.get(status.id);
								const tier = status.tiers.lastIndexOf(true) + 1;
								return (
									<RollChip
										key={status.id}
										text={`${status.name}-${tier}`}
										valence={status.valence}
										selected={line !== undefined}
										counted={line?.counted ?? false}
										value={line && signed(line.value)}
										badge={line && !line.counted ? "outranked" : undefined}
										onToggle={() => toggle(status.id)}
									/>
								);
							})}
						</ul>
					)}
				</section>

				<section className="flex flex-col gap-2">
					<h2 className={LABEL}>Story tags</h2>
					{character.storyTags.length === 0 ? (
						<p className="font-sans text-sm text-dim">Nothing in the scene.</p>
					) : (
						<ul className="flex flex-wrap gap-1.5">
							{character.storyTags.map((tag) => {
								const line = lineOf.get(tag.id);
								return (
									<RollChip
										key={tag.id}
										text={tag.name}
										valence={tag.scratched ? undefined : tag.valence}
										selected={line !== undefined}
										counted={line?.counted ?? false}
										value={line && signed(line.value)}
										badge={tag.scratched ? "scratched" : undefined}
										// A scratched tag is spent (T40), so it gets no control
										// to press rather than a control that refuses.
										onToggle={tag.scratched ? undefined : () => toggle(tag.id)}
									/>
								);
							})}
						</ul>
					)}
				</section>

				<RollControls />
			</div>

			<RollTotal {...breakdown} />

			{overriding && (
				<BurnOverride
					named={overriding.text.trim() || "this tag"}
					value={burnValueOfPick(overriding) ?? DEFAULT_BURN_VALUE}
					open
					onOpenChange={(open) => {
						if (!open) setOverriding(null);
					}}
					onChoose={(value) => {
						setPick((current) => ({
							...current,
							burnValues: { ...current.burnValues, [overriding.id]: value },
						}));
						setOverriding(null);
					}}
				/>
			)}
		</main>
	);
}
