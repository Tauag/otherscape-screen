"use client";

import { Button } from "@base-ui/react/button";
import { useState } from "react";
import { PlusIcon } from "@/app/character/[id]/_components/icons";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { StatusCard } from "@/app/character/[id]/play/_components/status-card";
import { StoryTagChip } from "@/app/character/[id]/play/_components/story-tag-chip";
import { LABEL } from "@/components/styles";
import { LabelAction } from "../_components/label-action";

const ADD =
	"inline-flex min-h-11 items-center gap-[5px] font-display text-[11px] font-semibold tracking-[0.1em] text-noise uppercase";

export default function PlayPage() {
	const { character, dispatch } = useCharacter();
	/** The card that opens for naming: the one this screen just added. */
	const [added, setAdded] = useState<string | null>(null);

	function addStatus() {
		const id = crypto.randomUUID();
		dispatch({ type: "addStatus", id, valence: "positive" });
		setAdded(id);
	}

	function addStoryTag() {
		const id = crypto.randomUUID();
		dispatch({ type: "addStoryTag", id, valence: "positive" });
		setAdded(id);
	}

	return (
		<main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-5 pt-4 pb-8">
			<section className="flex flex-col gap-2">
				<LabelAction label="Statuses" onClick={addStatus}>
					<PlusIcon /> Status
				</LabelAction>

				{character.statuses.length === 0 ? (
					<p className="font-sans text-sm text-dim">
						No statuses on the table. Add one as the session puts it there.
					</p>
				) : (
					<ul className="flex flex-col gap-2">
						{character.statuses.map((status) => (
							<StatusCard
								key={status.id}
								status={status}
								autoFocus={status.id === added}
							/>
						))}
					</ul>
				)}
			</section>

			<section className="flex flex-col gap-2">
				<LabelAction label="Story Tags" onClick={addStoryTag}>
					<PlusIcon /> Tag
				</LabelAction>

				{character.storyTags.length === 0 ? (
					<p className="font-sans text-sm text-dim">
						No story tags. Add one as the scene gives you something to work
						with.
					</p>
				) : (
					<ul className="flex flex-wrap gap-[7px]">
						{character.storyTags.map((tag) => (
							<StoryTagChip
								key={tag.id}
								tag={tag}
								autoFocus={tag.id === added}
							/>
						))}
					</ul>
				)}
			</section>
		</main>
	);
}
