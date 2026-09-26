"use client";

import { useState } from "react";
import { useRollSelection } from "@/app/character/[id]/_components/roll-selection";
import {
	burningTagId,
	burnToggleAction,
	cancelMitigationPick,
	finalizeRollPick,
	type RollTag,
	rollLabels,
	rollOrder,
	signed,
	startMitigationPick,
	toRollSelection,
} from "@/app/character/[id]/_lib/roll-selection";
import { RollChip } from "@/app/character/[id]/roll/_components/roll-chip";
import type { Character } from "@/lib/character/types";
import { DEFAULT_BURN_VALUE } from "@/lib/rules/constants";
import { power } from "@/lib/rules/power";
import type { CharacterAction } from "../_lib/reducer";

/** What useRollBoard hands back, for the board pieces that take it whole. */
export type RollBoard = ReturnType<typeof useRollBoard>;

/**
 * The roll builder's selection logic: what is picked, what it's worth, and the
 * tag chip that renders any of it. Shared by the phone roll screen and the
 * desktop board, which lay the same groups out differently.
 */
export function useRollBoard(
	character: Character,
	dispatch: (action: CharacterAction) => void,
) {
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

	const labels = rollLabels(character, pick);
	const rollLines = breakdown.lines.map((line, index) => ({
		...line,
		label: labels[index],
	}));

	const toggle = (id: string) => {
		// Locked out: this tag paid for the action that caused the consequence
		// being mitigated, so it can't also pay for the mitigation.
		if (pick.mitigationLockedIds.includes(id)) return;
		setPick((current) => ({
			...current,
			ids: current.ids.includes(id)
				? current.ids.filter((one) => one !== id)
				: [...current.ids, id],
		}));
	};

	const burnValueOfPick = (tag: RollTag) =>
		tag.burnValue === null ? null : (pick.burnValues[tag.id] ?? tag.burnValue);

	const finalizeTagSelection = () => {
		// A crispy story tag is one-time: rolling it in spends it for good.
		for (const tag of character.storyTags) {
			if (tag.crispy && pick.ids.includes(tag.id)) {
				dispatch({ type: "removeStoryTag", id: tag.id });
			}
		}
		// A crew tag is crispy too, but reversible: rolling it in just burns it,
		// same as a manual burn, so it can't be picked again until unburnt by
		// hand at the end of the session.
		for (const tag of character.crewTheme.powerTags) {
			if (!tag.burnt && pick.ids.includes(tag.id)) {
				dispatch({
					type: "burnCrewTag",
					tagId: tag.id,
					burnValue: DEFAULT_BURN_VALUE,
				});
			}
		}
		for (const relationship of character.crew) {
			if (!relationship.burnt && pick.ids.includes(relationship.id)) {
				dispatch({ type: "burnCrewRelationship", id: relationship.id });
			}
		}
		setPick(finalizeRollPick);
	};

	const startMitigation = () => setPick(startMitigationPick);
	const cancelMitigation = () => setPick(cancelMitigationPick);

	const burning = burningTagId(character, pick);
	const setBurnt = (tagId: string, burnt: boolean) => {
		const action = burnToggleAction(character, tagId, burnt);
		if (action) dispatch(action);
	};

	const tagChip = (tag: RollTag, hue?: string) => {
		const line = lineOf.get(tag.id);
		const selected = line !== undefined;
		// Already burnt on the sheet: spent, so it can't be picked for a roll.
		const burnt = tag.burnValue !== null;
		const locked = pick.mitigationLockedIds.includes(tag.id);
		const canBurnControl =
			burnt || (selected && tag.canBurn && burning === null);
		return (
			<RollChip
				key={tag.id}
				text={tag.text}
				type={tag.valence === "positive" ? (hue as never) : undefined}
				valence={tag.valence === "negative" ? "negative" : undefined}
				burnt={burnt}
				broad={tag.broad}
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
				onToggle={burnt || locked ? undefined : () => toggle(tag.id)}
				onValueClick={selected && burnt ? () => setOverriding(tag) : undefined}
				onBurntChange={
					canBurnControl ? (next) => setBurnt(tag.id, next) : undefined
				}
			/>
		);
	};

	return {
		pick,
		setPick,
		breakdown,
		rollLines,
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
	};
}
