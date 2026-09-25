"use client";

import { Input } from "@base-ui/react/input";
import { Menu } from "@base-ui/react/menu";
import { useState } from "react";
import { ChipBadge } from "@/components/chip-badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { RowMenu } from "@/components/row-menu";
import { MENU_ITEM } from "@/components/styles";
import type { StoryTag } from "@/lib/character/types";
import { DEFAULT_BURN_VALUE } from "@/lib/rules/constants";
import { useCampaign } from "../_hooks/use-campaign";

/**
 * One story tag, campaign- or NPC-scoped (`npcId` absent means the
 * campaign's own list). Looks like components/story-tag-chip.tsx's read-only
 * chip - the same "story"/"story · 1x" label and burnt treatment - but every
 * field is editable, per design.md 8.2: a GM's tag reads exactly like the
 * player board's.
 */
export function StoryTagRow({ tag, npcId }: { tag: StoryTag; npcId?: string }) {
	const { dispatch } = useCampaign();
	const [renaming, setRenaming] = useState(false);
	const named = tag.name.trim() || "this tag";
	// Mirrors app/character/[id]/play/_components/story-tag-chip.tsx's canBurn:
	// only a positive, non-crispy tag ever shows Burn or Unburn.
	const canBurn = tag.valence === "positive" && !tag.crispy;

	return (
		<li
			data-valence={tag.valence}
			className={`flex items-center rounded-sm border ${
				tag.burnt
					? "border-dashed border-pip bg-[repeating-linear-gradient(135deg,transparent_0_4px,rgba(255,255,255,.025)_4px_8px)]"
					: "border-[var(--hue)]/32 bg-[var(--hue)]/7"
			}`}
		>
			<div className="flex min-h-11 min-w-0 flex-1 items-center gap-[7px] px-[9px] py-1.5">
				<span
					className={`shrink-0 font-mono text-[9px] font-bold ${
						tag.burnt ? "text-faint" : "text-[var(--hue)]/80"
					}`}
				>
					{tag.crispy ? "story · 1x" : "story"}
				</span>
				<span
					className={`truncate font-display text-[13px] ${
						tag.burnt ? "text-muted line-through" : "text-[var(--hue-text)]"
					}`}
				>
					{tag.name.trim() || "Unnamed"}
				</span>
				{tag.burnt && <ChipBadge>BURNT</ChipBadge>}
			</div>

			<RowMenu label={`Menu for ${named}`} className="border-l border-hairline">
				<Menu.Item className={MENU_ITEM} onClick={() => setRenaming(true)}>
					Rename
				</Menu.Item>
				<Menu.Item
					className={MENU_ITEM}
					onClick={() =>
						dispatch({
							type: "setStoryTagValence",
							npcId,
							id: tag.id,
							valence: tag.valence === "positive" ? "negative" : "positive",
						})
					}
				>
					{tag.valence === "positive" ? "Make it negative" : "Make it positive"}
				</Menu.Item>
				{canBurn && (
					<Menu.Item
						className={MENU_ITEM}
						onClick={() =>
							dispatch(
								tag.burnt
									? { type: "unburnStoryTag", npcId, id: tag.id }
									: {
											type: "burnStoryTag",
											npcId,
											id: tag.id,
											burnValue: DEFAULT_BURN_VALUE,
										},
							)
						}
					>
						{tag.burnt ? "Unburn" : "Burn"}
					</Menu.Item>
				)}
				<Menu.Item
					className={MENU_ITEM}
					onClick={() =>
						dispatch({ type: "toggleStoryTagCrispy", npcId, id: tag.id })
					}
				>
					{tag.crispy ? "Clear crispy (1x)" : "Mark crispy (1x)"}
				</Menu.Item>
				<Menu.Item
					className={MENU_ITEM}
					onClick={() =>
						dispatch({ type: "removeStoryTag", npcId, id: tag.id })
					}
				>
					Delete
				</Menu.Item>
			</RowMenu>

			<ConfirmDialog
				open={renaming}
				onOpenChange={setRenaming}
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
								npcId,
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
