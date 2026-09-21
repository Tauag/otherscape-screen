"use client";

import { Button } from "@base-ui/react/button";
import { SMALL_BUTTON } from "@/app/character/[id]/_components/styles";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { useRollBoard } from "@/app/character/[id]/_hooks/use-roll-board";
import {
	rollGroups,
	signed,
	storyRollTag,
} from "@/app/character/[id]/_lib/roll-selection";
import { BurnOverride } from "@/app/character/[id]/roll/_components/burn-override";
import { RollChip } from "@/app/character/[id]/roll/_components/roll-chip";
import { RollControls } from "@/app/character/[id]/roll/_components/roll-controls";
import { RollTotal } from "@/app/character/[id]/roll/_components/roll-total";
import { LABEL } from "@/components/styles";
import { DEFAULT_BURN_VALUE } from "@/lib/rules/constants";

export default function RollPage() {
	const { character, dispatch } = useCharacter();
	const {
		pick,
		setPick,
		breakdown,
		lineOf,
		toggle,
		setBurnt,
		burning,
		tagChip,
		finalizeTagSelection,
		startMitigation,
		cancelMitigation,
		overriding,
		setOverriding,
		burnValueOfPick,
	} = useRollBoard(character, dispatch);

	return (
		<main className="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col pb-8">
			<div className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-5 py-3.5">
				{pick.mitigationLockedIds.length > 0 && (
					<div className="flex items-center justify-between gap-2 rounded-sm border border-border bg-recess px-3 py-2">
						<p className="font-sans text-xs text-dim">
							Mitigating — {pick.mitigationLockedIds.length} tag
							{pick.mitigationLockedIds.length === 1 ? "" : "s"} from that
							action locked out.
						</p>
						<Button
							type="button"
							onClick={cancelMitigation}
							className={SMALL_BUTTON}
						>
							Cancel
						</Button>
					</div>
				)}

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
								const locked = pick.mitigationLockedIds.includes(status.id);
								return (
									<RollChip
										key={status.id}
										text={`${status.name}-${tier}`}
										valence={status.valence}
										selected={line !== undefined}
										counted={line?.counted ?? false}
										value={line && signed(line.value)}
										badge={
											line && !line.counted
												? "outranked"
												: locked
													? "locked"
													: undefined
										}
										onToggle={locked ? undefined : () => toggle(status.id)}
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
								const selected = line !== undefined;
								const burnt = rollTag.burnValue !== null;
								const locked = pick.mitigationLockedIds.includes(tag.id);
								const canBurnControl =
									selected && (burnt || (rollTag.canBurn && burning === null));
								return (
									<RollChip
										key={tag.id}
										text={tag.name}
										valence={tag.valence}
										burnt={burnt}
										selected={selected}
										counted={line?.counted ?? false}
										value={line && signed(line.value)}
										badge={
											burnt
												? "BURNT"
												: locked
													? "locked"
													: tag.crispy
														? "crispy"
														: undefined
										}
										onToggle={
											burnt || locked ? undefined : () => toggle(tag.id)
										}
										onValueClick={
											selected && burnt
												? () => setOverriding(rollTag)
												: undefined
										}
										onBurntChange={
											canBurnControl
												? (next) => setBurnt(tag.id, next)
												: undefined
										}
									/>
								);
							})}
						</ul>
					)}
				</section>

				<RollControls />
			</div>

			<RollTotal
				total={breakdown.total}
				modifier={pick.modifier}
				onRoll={finalizeTagSelection}
				canMitigate={pick.lastRolledIds.length > 0}
				onStartMitigation={startMitigation}
			/>

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
