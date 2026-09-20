"use client";

import { Input } from "@base-ui/react/input";
import { Menu } from "@base-ui/react/menu";
import { BurnButton } from "@/app/character/[id]/_components/burn-button";
import { MENU_ITEM } from "@/app/character/[id]/_components/styles";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { RowMenu } from "@/app/character/[id]/play/_components/row-menu";
import { ChipBadge } from "@/components/chip-badge";
import type { StoryTag } from "@/lib/character/types";
import { DEFAULT_BURN_VALUE } from "@/lib/rules/constants";

const NAME =
	"min-h-11 min-w-[8ch] max-w-full bg-transparent font-display text-sm placeholder:text-dim field-sizing-content pr-3";

export function StoryTagChip({
	tag,
	autoFocus,
}: {
	tag: StoryTag;
	/** True for the chip the player just added, so the name takes the caret. */
	autoFocus: boolean;
}) {
	const { dispatch } = useCharacter();
	const named = tag.name.trim() || "this tag";
	const canBurn = tag.valence === "positive" && !tag.crispy;

	return (
		<li
			data-valence={tag.valence}
			className={`flex items-center rounded-sm border pr-1 pl-3 ${
				tag.burnt
					? "border-dashed border-pip"
					: "border-[var(--hue)]/40 bg-[var(--hue)]/7"
			}`}
		>
			<Input
				type="text"
				autoComplete="off"
				value={tag.name}
				autoFocus={autoFocus}
				onChange={(event) =>
					dispatch({
						type: "renameStoryTag",
						id: tag.id,
						name: event.target.value,
					})
				}
				aria-label="Story tag"
				placeholder="Name this tag"
				className={`${NAME} ${
					tag.burnt ? "text-muted line-through" : "text-[var(--hue-text)]"
				}`}
			/>

			{tag.crispy && <ChipBadge>crispy</ChipBadge>}

			{canBurn && (
				<BurnButton
					burnt={tag.burnt}
					onBurntChange={(burnt) =>
						dispatch(
							burnt
								? {
										type: "burnStoryTag",
										id: tag.id,
										burnValue: DEFAULT_BURN_VALUE,
									}
								: { type: "unburnStoryTag", id: tag.id },
						)
					}
					named={named}
				/>
			)}

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
				<Menu.Item
					className={MENU_ITEM}
					onClick={() => dispatch({ type: "removeStoryTag", id: tag.id })}
				>
					Delete
				</Menu.Item>
			</RowMenu>
		</li>
	);
}
