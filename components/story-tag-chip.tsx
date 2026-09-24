import { Chip } from "@/components/chip";
import type { StoryTag } from "@/lib/character/types";

export function StoryTagChip({ tag }: { tag: StoryTag }) {
	return (
		<span data-valence={tag.valence}>
			<Chip
				label={tag.crispy ? "story · 1x" : "story"}
				text={tag.name}
				burnt={tag.burnt}
				negative={tag.valence === "negative"}
			/>
		</span>
	);
}
