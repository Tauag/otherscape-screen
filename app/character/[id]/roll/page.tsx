"use client";

import { useState } from "react";
import { useRollSelection } from "@/app/character/[id]/_components/roll-selection";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import {
	type RollTag,
	rollGroups,
	rollOrder,
	signed,
	storyRollTag,
	toRollSelection,
} from "@/app/character/[id]/_lib/roll-selection";
import { BurnOverride } from "@/app/character/[id]/roll/_components/burn-override";
import { RollChip } from "@/app/character/[id]/roll/_components/roll-chip";
import { RollControls } from "@/app/character/[id]/roll/_components/roll-controls";
import { RollTotal } from "@/app/character/[id]/roll/_components/roll-total";
import { LABEL } from "@/components/styles";
import { DEFAULT_BURN_VALUE } from "@/lib/rules/constants";
import { power } from "@/lib/rules/power";

export default function RollPage() {
	const { character } = useCharacter();
	const { pick, setPick } = useRollSelection();
	const [overriding, setOverriding] = useState<RollTag | null>(null);
	const selection = toRollSelection(character, pick);
	const breakdown = power(selection);
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
		<main className="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col pb-8">
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
					{character.statuses.length === 0 ? (
						<p className="font-sans text-sm text-dim">Nothing on the table.</p>
					) : (
						<ul className="flex flex-wrap gap-1.5">
							{character.statuses.map((status) => {
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
								const rollTag = storyRollTag(tag);
								const line = lineOf.get(tag.id);
								const burnt = burnValueOfPick(rollTag) !== null;
								return (
									<RollChip
										key={tag.id}
										text={tag.name}
										valence={tag.valence}
										burnt={burnt}
										selected={line !== undefined}
										counted={line?.counted ?? false}
										value={line && signed(line.value)}
										badge={burnt ? "BURNT" : tag.crispy ? "crispy" : undefined}
										onToggle={() => toggle(tag.id)}
										onValueClick={
											line && burnt ? () => setOverriding(rollTag) : undefined
										}
									/>
								);
							})}
						</ul>
					)}
				</section>

				<RollControls />
			</div>

			<RollTotal total={breakdown.total} modifier={pick.modifier} />

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
