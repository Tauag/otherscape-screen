import { Chip } from "@/components/chip";
import type { StoryTag } from "@/lib/character/types";

export function StoryTagChip({ tag }: { tag: StoryTag }) {
	return (
		<span data-valence={tag.valence}>
			<Chip
				label="story"
				text={tag.name}
				burnt={tag.scratched}
				negative={tag.valence === "negative"}
			/>
		</span>
	);
}
