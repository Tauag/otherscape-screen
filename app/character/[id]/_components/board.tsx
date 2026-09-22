"use client";

import { Button } from "@base-ui/react/button";
import { Input } from "@base-ui/react/input";
import { Menu } from "@base-ui/react/menu";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
	CrewPanel,
	LoadoutPanel,
	ThemePanel,
} from "@/app/character/[id]/_components/board-panel";
import { ConfirmDialog } from "@/app/character/[id]/_components/confirm-dialog";
import { PlusIcon } from "@/app/character/[id]/_components/icons";
import { LabelAction } from "@/app/character/[id]/_components/label-action";
import {
	MENU_ITEM,
	SMALL_BUTTON,
} from "@/app/character/[id]/_components/styles";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { useRollBoard } from "@/app/character/[id]/_hooks/use-roll-board";
import {
	boardGroups,
	signed,
	storyRollTag,
} from "@/app/character/[id]/_lib/roll-selection";
import { RowMenu } from "@/app/character/[id]/play/_components/row-menu";
import { StatusCard } from "@/app/character/[id]/play/_components/status-card";
import { BurnOverride } from "@/app/character/[id]/roll/_components/burn-override";
import { RollChip } from "@/app/character/[id]/roll/_components/roll-chip";
import { RollControls } from "@/app/character/[id]/roll/_components/roll-controls";
import { RollTotal } from "@/app/character/[id]/roll/_components/roll-total";
import { decayFull } from "@/lib/character/loss";
import { themeTitle } from "@/lib/character/theme";
import type { Character, StoryTag } from "@/lib/character/types";
import { DEFAULT_BURN_VALUE, STARTING_THEMES } from "@/lib/rules/constants";
import { essenceSuggestion } from "@/lib/rules/essence-suggestion";
import { loadoutSpend } from "@/lib/rules/loadout";
import { themeCountWarning } from "@/lib/rules/readiness";

/** The theme-count, essence-tie, over-budget, and decay-full sentences: one
 *  full-width strip under the app bar (design.md 5, resolved layout questions). */
function boardWarnings(character: Character): string[] {
	const warnings: string[] = [];

	// design.md 5, resolved layout questions: a themeless character shows the
	// sheet's own empty-state sentence in this same strip, since the grid then
	// holds only loadout and crew.
	if (character.themes.length === 0) {
		warnings.push("This character has no themes yet.");
	}

	const count = themeCountWarning(character.themes.length);
	if (count) warnings.push(count);

	const { candidates, state } = essenceSuggestion(
		character.themes,
		character.essence,
	);
	if (state === "unchosen" && candidates.length > 1) {
		warnings.push(
			`Your themes tie between ${candidates[0]} and ${candidates[1]}. Pick one from the menu.`,
		);
	}

	const spendWarning = loadoutSpend(character.loadout).warning;
	if (spendWarning) warnings.push(spendWarning);

	for (const theme of character.themes) {
		if (decayFull(theme)) {
			const named = themeTitle(theme)?.text.trim() || "A theme";
			warnings.push(`${named}'s Decay track is full.`);
		}
	}
	if (decayFull(character.crewTheme)) {
		warnings.push("The crew's Decay track is full.");
	}

	return warnings;
}

export function Board() {
	const { character, dispatch } = useCharacter();
	const { id } = useParams<{ id: string }>();
	const [added, setAdded] = useState<string | null>(null);

	const {
		pick,
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
		setPick,
	} = useRollBoard(character, dispatch);

	const groups = boardGroups(character);
	const themeGroups = groups.slice(0, character.themes.length);
	const loadoutGroup = groups[character.themes.length];
	const crewGroup = groups[character.themes.length + 1];
	const warnings = boardWarnings(character);

	function addStatus() {
		const statusId = crypto.randomUUID();
		dispatch({ type: "addStatus", id: statusId, valence: "positive" });
		setAdded(statusId);
	}

	function addStoryTag() {
		const tagId = crypto.randomUUID();
		dispatch({ type: "addStoryTag", id: tagId, valence: "positive" });
		setAdded(tagId);
	}

	function storyTagRow(tag: StoryTag) {
		const rollTag = storyRollTag(tag);
		const line = lineOf.get(tag.id);
		const selected = line !== undefined;
		const burnt = rollTag.burnValue !== null;
		const locked = pick.mitigationLockedIds.includes(tag.id);
		const canBurnControl =
			selected && (burnt || (rollTag.canBurn && burning === null));
		const named = tag.name.trim() || "this tag";

		return (
			<li key={tag.id} className="flex items-center gap-1">
				<ul className="min-w-0 flex-1">
					<RollChip
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
						onToggle={burnt || locked ? undefined : () => toggle(tag.id)}
						onValueClick={
							selected && burnt ? () => setOverriding(rollTag) : undefined
						}
						onBurntChange={
							canBurnControl ? (next) => setBurnt(tag.id, next) : undefined
						}
					/>
				</ul>
				<RowMenu label={`Menu for ${named}`}>
					<Menu.Item
						className={MENU_ITEM}
						onClick={() =>
							dispatch({
								type: "setStoryTagValence",
								id: tag.id,
								valence: tag.valence === "positive" ? "negative" : "positive",
							})
						}
					>
						{tag.valence === "positive"
							? "Make it negative"
							: "Make it positive"}
					</Menu.Item>
					<Menu.Item
						className={MENU_ITEM}
						onClick={() =>
							dispatch({ type: "toggleStoryTagCrispy", id: tag.id })
						}
					>
						{tag.crispy ? "Make it reusable" : "Make it crispy"}
					</Menu.Item>
					<Menu.Item className={MENU_ITEM} onClick={() => setAdded(tag.id)}>
						Rename
					</Menu.Item>
					<Menu.Item
						className={MENU_ITEM}
						onClick={() => dispatch({ type: "removeStoryTag", id: tag.id })}
					>
						Delete
					</Menu.Item>
				</RowMenu>

				<ConfirmDialog
					open={added === tag.id}
					onOpenChange={(open) => {
						if (!open) setAdded(null);
					}}
					title="Rename tag"
					cancelLabel="Done"
				>
					{/* biome-ignore lint/a11y/noLabelWithoutControl: Base UI's Input renders a real <input> inside this label. */}
					<label className="flex min-h-11 items-center">
						<span className="sr-only">Story tag</span>
						<Input
							type="text"
							autoComplete="off"
							autoFocus
							value={tag.name}
							onChange={(event) =>
								dispatch({
									type: "renameStoryTag",
									id: tag.id,
									name: event.target.value,
								})
							}
							placeholder="Name this tag"
							className="w-full rounded-sm border border-border bg-bg px-3 font-display text-sm text-text placeholder:text-dim"
						/>
					</label>
				</ConfirmDialog>
			</li>
		);
	}

	return (
		<div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-bg">
			{warnings.length > 0 && (
				<p className="shrink-0 border-b border-edge bg-recess px-5 py-2 font-sans text-sm text-negative-text">
					{warnings.join(" ")}
				</p>
			)}

			<div className="flex min-h-0 flex-1">
				<div className="grid min-h-0 min-w-0 flex-1 grid-cols-2 content-start gap-3.5 overflow-y-auto p-5 xl:grid-cols-3">
					{character.themes.map((theme, index) => (
						<ThemePanel
							key={theme.id}
							theme={theme}
							group={themeGroups[index]}
							tagChip={tagChip}
							id={id}
						/>
					))}

					{character.themes.length < STARTING_THEMES && (
						<Button
							type="button"
							onClick={() =>
								dispatch({ type: "addTheme", id: crypto.randomUUID() })
							}
							className="flex min-h-[88px] items-center justify-center gap-1.5 rounded-md border border-raised border-dashed bg-recess font-display text-xs font-semibold tracking-[0.08em] text-dim uppercase"
						>
							<PlusIcon /> Theme card
						</Button>
					)}

					<LoadoutPanel
						loadout={character.loadout}
						group={loadoutGroup}
						tagChip={tagChip}
						id={id}
					/>

					<CrewPanel
						crewTheme={character.crewTheme}
						group={crewGroup}
						tagChip={tagChip}
						id={id}
					/>
				</div>

				<aside
					aria-label="The table"
					className="flex min-h-0 w-[300px] shrink-0 flex-col border-l border-edge bg-chrome/40 xl:w-[340px]"
				>
					<div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
						<div className="flex flex-col gap-2">
							<LabelAction label="Statuses" onClick={addStatus}>
								<PlusIcon /> Status
							</LabelAction>
							{character.statuses.length === 0 ? (
								<p className="font-sans text-sm text-dim">
									Nothing on the table.
								</p>
							) : (
								<ul className="flex flex-col gap-2">
									{character.statuses.map((row) => {
										const locked = pick.mitigationLockedIds.includes(row.id);
										return (
											<StatusCard
												key={row.id}
												status={row}
												autoFocus={row.id === added}
												selected={lineOf.get(row.id) !== undefined}
												onToggle={locked ? undefined : () => toggle(row.id)}
											/>
										);
									})}
								</ul>
							)}
						</div>

						<div className="flex flex-col gap-2">
							<LabelAction label="Story tags" onClick={addStoryTag}>
								<PlusIcon /> Tag
							</LabelAction>
							{character.storyTags.length === 0 ? (
								<p className="font-sans text-sm text-dim">
									Nothing in the scene.
								</p>
							) : (
								<ul className="flex flex-col gap-1.5">
									{character.storyTags.map(storyTagRow)}
								</ul>
							)}
						</div>
					</div>

					<div className="flex shrink-0 flex-col gap-3 border-t border-edge bg-chrome p-3">
						{pick.mitigationLockedIds.length > 0 ? (
							<div className="flex items-center justify-between gap-3 rounded-[5px] border border-hairline bg-recess p-3">
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
						) : (
							<RollControls />
						)}

						<RollTotal
							total={breakdown.total}
							modifier={pick.modifier}
							onRoll={finalizeTagSelection}
							canMitigate={pick.lastRolledIds.length > 0}
							onStartMitigation={startMitigation}
						/>
					</div>
				</aside>
			</div>

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
		</div>
	);
}
