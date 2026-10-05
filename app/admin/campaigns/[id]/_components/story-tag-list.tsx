"use client";

import { Input } from "@base-ui/react/input";
import { useState } from "react";
import type { StoryTag } from "@/lib/character/types";
import { useCampaign } from "../_hooks/use-campaign";
import { StoryTagRow } from "./story-tag-row";

/**
 * Story tags as wrapping chips, with an inline input as the last chip:
 * type and press Enter to add. `challengeId` absent means the campaign's own
 * list. A new tag starts positive; the chip menu flips it.
 */
export function StoryTagList({
	tags,
	challengeId,
}: {
	tags: StoryTag[];
	challengeId?: string;
}) {
	const { dispatch } = useCampaign();
	const [name, setName] = useState("");

	function add(event: React.FormEvent) {
		event.preventDefault();
		const trimmed = name.trim();
		if (!trimmed) return;
		dispatch({
			type: "addStoryTag",
			challengeId,
			id: crypto.randomUUID(),
			name: trimmed,
			valence: "positive",
		});
		setName("");
	}

	return (
		<ul className="flex flex-wrap gap-1.5">
			{tags.map((tag) => (
				<StoryTagRow key={tag.id} tag={tag} challengeId={challengeId} />
			))}
			<li className="flex">
				<form onSubmit={add} className="flex">
					<Input
						value={name}
						onChange={(event) => setName(event.target.value)}
						autoComplete="off"
						enterKeyHint="done"
						aria-label="New story tag"
						placeholder="+ story tag"
						className="min-h-11 w-36 rounded-sm border border-dashed border-border bg-transparent px-[9px] font-display text-[13px] text-text placeholder:text-dim"
					/>
				</form>
			</li>
		</ul>
	);
}
