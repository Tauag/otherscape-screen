"use client";

import { Input } from "@base-ui/react/input";
import { Menu } from "@base-ui/react/menu";
import { ConfirmDialog } from "@/app/character/[id]/_components/confirm-dialog";
import { MENU_ITEM } from "@/app/character/[id]/_components/styles";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import type { RollBoard } from "@/app/character/[id]/_hooks/use-roll-board";
import { signed, storyRollTag } from "@/app/character/[id]/_lib/roll-selection";
import { RowMenu } from "@/app/character/[id]/play/_components/row-menu";
import { RollChip } from "@/app/character/[id]/roll/_components/roll-chip";
import type { StoryTag } from "@/lib/character/types";

/** A story tag on the board's table: the roll chip plus its row menu. The
 *  board's narrow aside has no room for the phone screen's inline name field,
 *  so renaming opens a dialog instead. */
export function BoardStoryTagRow({
	tag,
	board,
	renaming,
	onRenamingChange,
}: {
	tag: StoryTag;
	board: RollBoard;
	renaming: boolean;
	onRenamingChange: (open: boolean) => void;
}) {
	const { dispatch } = useCharacter();
	const { pick, lineOf, toggle, setBurnt, burning, setOverriding } = board;

	const rollTag = storyRollTag(tag);
	const line = lineOf.get(tag.id);
	const selected = line !== undefined;
	const burnt = rollTag.burnValue !== null;
	const locked = pick.mitigationLockedIds.includes(tag.id);
	const canBurnControl =
		selected && (burnt || (rollTag.canBurn && burning === null));
	const named = tag.name.trim() || "this tag";

	return (
		<li className="flex items-center gap-1">
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
					{tag.valence === "positive" ? "Make it negative" : "Make it positive"}
				</Menu.Item>
				<Menu.Item
					className={MENU_ITEM}
					onClick={() => dispatch({ type: "toggleStoryTagCrispy", id: tag.id })}
				>
					{tag.crispy ? "Make it reusable" : "Make it crispy"}
				</Menu.Item>
				<Menu.Item className={MENU_ITEM} onClick={() => onRenamingChange(true)}>
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
				open={renaming}
				onOpenChange={onRenamingChange}
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
