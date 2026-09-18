"use client";

import { Input } from "@base-ui/react/input";
import { Menu } from "@base-ui/react/menu";
import { MENU_ITEM } from "@/app/character/[id]/_components/styles";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { RowMenu } from "@/app/character/[id]/play/_components/row-menu";
import type { StoryTag } from "@/lib/character/types";

// lazy: field-sizing keeps each chip as wide as its tag. Where a browser lacks
// it the chips take the input's default width, so they wrap sooner.
const NAME =
	"min-h-11 min-w-[8ch] max-w-full bg-transparent font-display text-sm placeholder:text-dim field-sizing-content";

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

	return (
		<li
			// A scratched tag is spent, so it drops its valence and reads neutral.
			data-valence={tag.scratched ? undefined : tag.valence}
			className={`flex items-center rounded-sm border pr-1 pl-3 ${
				tag.scratched
					? "border-border"
					: "border-[var(--hue)]/40 bg-[var(--hue)]/7"
			}`}
		>
			<Input
				type="text"
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
				placeholder="Name it"
				className={`${NAME} ${
					tag.scratched ? "text-faint line-through" : "text-[var(--hue-text)]"
				}`}
			/>

			<RowMenu label={`Menu for ${named}`}>
				<Menu.Item
					className={MENU_ITEM}
					onClick={() =>
						dispatch({ type: "toggleStoryTagScratched", id: tag.id })
					}
				>
					{tag.scratched ? "Bring it back" : "Scratch it"}
				</Menu.Item>
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
					onClick={() => dispatch({ type: "removeStoryTag", id: tag.id })}
				>
					Delete
				</Menu.Item>
			</RowMenu>
		</li>
	);
}
