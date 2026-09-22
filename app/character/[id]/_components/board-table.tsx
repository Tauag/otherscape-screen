"use client";

import { Button } from "@base-ui/react/button";
import { useState } from "react";
import { BoardStoryTagRow } from "@/app/character/[id]/_components/board-story-tag-row";
import { PlusIcon } from "@/app/character/[id]/_components/icons";
import { LabelAction } from "@/app/character/[id]/_components/label-action";
import { SMALL_BUTTON } from "@/app/character/[id]/_components/styles";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import type { RollBoard } from "@/app/character/[id]/_hooks/use-roll-board";
import { StatusCard } from "@/app/character/[id]/play/_components/status-card";
import { RollControls } from "@/app/character/[id]/roll/_components/roll-controls";
import { RollTotal } from "@/app/character/[id]/roll/_components/roll-total";

/** The board's right rail: what the scene put on the table, and the roll
 *  builder that spends it. */
export function BoardTable({ board }: { board: RollBoard }) {
	const { character, dispatch } = useCharacter();
	/** The row that opens for naming: the one this rail just added. */
	const [added, setAdded] = useState<string | null>(null);

	const {
		pick,
		breakdown,
		lineOf,
		toggle,
		finalizeTagSelection,
		startMitigation,
		cancelMitigation,
	} = board;

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

	return (
		<aside
			aria-label="The table"
			className="flex min-h-0 w-[340px] shrink-0 flex-col border-l border-edge bg-chrome/40 xl:w-[370px]"
		>
			<div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
				<div className="flex flex-col gap-2">
					<LabelAction label="Statuses" onClick={addStatus}>
						<PlusIcon /> Status
					</LabelAction>
					{character.statuses.length === 0 ? (
						<p className="font-sans text-sm text-dim">Nothing on the table.</p>
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
						<p className="font-sans text-sm text-dim">Nothing in the scene.</p>
					) : (
						<ul className="flex flex-col gap-1.5">
							{character.storyTags.map((tag) => (
								<BoardStoryTagRow
									key={tag.id}
									tag={tag}
									board={board}
									renaming={added === tag.id}
									onRenamingChange={(open) => setAdded(open ? tag.id : null)}
								/>
							))}
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
	);
}
