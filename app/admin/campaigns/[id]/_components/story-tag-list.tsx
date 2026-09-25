"use client";

import { Button } from "@base-ui/react/button";
import { Input } from "@base-ui/react/input";
import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { useId, useState } from "react";
import { LABEL } from "@/components/styles";
import type { StoryTag, Valence } from "@/lib/character/types";
import { useCampaign } from "../_hooks/use-campaign";
import { StoryTagRow } from "./story-tag-row";

const SEGMENT =
	"min-h-11 flex-1 px-3 font-mono text-[10px] tracking-[0.08em] text-dim uppercase";
const ADD_TRIGGER =
	"flex min-h-11 items-center justify-center gap-1.5 rounded-sm border border-dashed border-pip font-mono text-[10px] tracking-[0.08em] text-dim uppercase";

/**
 * A list of story tags, plus the "New story tag" form. `npcId` is the only
 * thing that varies between the campaign's own aside section and one NPC's
 * card (T66): everything else - the rows, the add form - is unchanged.
 */
export function StoryTagList({
	tags,
	npcId,
	collapsed,
}: {
	tags: StoryTag[];
	npcId?: string;
	/** Show a "+ Story tag" trigger instead of the always-open form, for a
	 *  dense NPC card (T66), with a Cancel to collapse it again. */
	collapsed?: boolean;
}) {
	const { dispatch } = useCampaign();
	const [name, setName] = useState("");
	const [valence, setValence] = useState<Valence>("positive");
	const [open, setOpen] = useState(!collapsed);
	const inputId = useId();

	function add(event: React.FormEvent) {
		event.preventDefault();
		const trimmed = name.trim();
		if (!trimmed) return;
		dispatch({
			type: "addStoryTag",
			npcId,
			id: crypto.randomUUID(),
			name: trimmed,
			valence,
		});
		setName("");
	}

	return (
		<div className="flex flex-col gap-2">
			{tags.length === 0 ? (
				<p className="font-sans text-sm text-dim">No story tags yet.</p>
			) : (
				<ul className="flex flex-col gap-1.5">
					{tags.map((tag) => (
						<StoryTagRow key={tag.id} tag={tag} npcId={npcId} />
					))}
				</ul>
			)}

			{open ? (
				<form onSubmit={add} className="flex flex-col gap-2">
					<label htmlFor={inputId} className={LABEL}>
						New story tag
					</label>
					<Input
						id={inputId}
						value={name}
						onChange={(event) => setName(event.target.value)}
						autoComplete="off"
						autoFocus={collapsed}
						placeholder="e.g. flooded arcade"
						className="min-h-11 w-full rounded-sm border border-border bg-bg px-3 font-sans text-sm text-text placeholder:text-dim"
					/>
					<div className="flex gap-2">
						<ToggleGroup
							value={[valence]}
							onValueChange={(values) => {
								const next = values[0] as Valence | undefined;
								if (next) setValence(next);
							}}
							aria-label="Valence"
							className="flex overflow-hidden rounded-sm border border-border"
						>
							<Toggle
								value="positive"
								className={`${SEGMENT} data-[pressed]:bg-positive/12 data-[pressed]:text-positive-text`}
							>
								Positive
							</Toggle>
							<Toggle
								value="negative"
								className={`${SEGMENT} data-[pressed]:bg-negative/12 data-[pressed]:text-negative-text`}
							>
								Negative
							</Toggle>
						</ToggleGroup>
						<Button
							type="submit"
							className="inline-flex min-h-11 flex-1 items-center justify-center rounded-sm border border-border px-4 font-display text-sm font-semibold tracking-[0.08em] uppercase"
						>
							Add
						</Button>
					</div>
					{collapsed ? (
						<Button
							type="button"
							onClick={() => {
								setName("");
								setOpen(false);
							}}
							className="font-mono text-[10px] tracking-[0.08em] text-dim uppercase"
						>
							Cancel
						</Button>
					) : null}
				</form>
			) : (
				<Button
					type="button"
					onClick={() => setOpen(true)}
					className={ADD_TRIGGER}
				>
					+ Story tag
				</Button>
			)}
		</div>
	);
}
