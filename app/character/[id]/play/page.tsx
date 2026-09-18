"use client";

import { Button } from "@base-ui/react/button";
import { useState } from "react";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { StatusCard } from "@/app/character/[id]/play/_components/status-card";
import { StoryTagChip } from "@/app/character/[id]/play/_components/story-tag-chip";
import { LABEL } from "@/components/styles";

const ADD =
	"inline-flex min-h-11 items-center gap-[5px] font-display text-[11px] font-semibold tracking-[0.1em] text-noise uppercase";

const PLUS = (
	<svg
		aria-hidden="true"
		width="13"
		height="13"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2.2"
		strokeLinecap="round"
	>
		<path d="M12 5v14M5 12h14" />
	</svg>
);

export default function PlayPage() {
	const { character, dispatch } = useCharacter();
	/** The card that opens for naming: the one this screen just added. */
	const [added, setAdded] = useState<string | null>(null);

	const mine = character.statuses.filter((status) => status.owner === "mine");
	const mc = character.statuses.filter((status) => status.owner === "mc");

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

	const card = (status: (typeof mine)[number]) => (
		<StatusCard
			key={status.id}
			status={status}
			autoFocus={status.id === added}
		/>
	);

	return (
		<main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-5 pt-4 pb-8">
			<section className="flex flex-col gap-2">
				<div className="flex items-baseline justify-between">
					<h2 className={LABEL}>Mine</h2>
					<Button type="button" onClick={addStatus} className={ADD}>
						{PLUS}
						Status
					</Button>
				</div>

				{mine.length === 0 ? (
					<p className="font-sans text-sm text-dim">
						No statuses on you. Add one as the session puts it there.
					</p>
				) : (
					<ul className="flex flex-col gap-2">{mine.map(card)}</ul>
				)}
			</section>

			{mc.length > 0 && (
				<section className="flex flex-col gap-2">
					<h2 className={LABEL}>{"The MC's"}</h2>
					<ul className="flex flex-col gap-2">{mc.map(card)}</ul>
				</section>
			)}

			<section className="flex flex-col gap-2">
				<div className="flex items-baseline justify-between">
					<h2 className={LABEL}>Story tags</h2>
					<Button type="button" onClick={addStoryTag} className={ADD}>
						{PLUS}
						Tag
					</Button>
				</div>

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
