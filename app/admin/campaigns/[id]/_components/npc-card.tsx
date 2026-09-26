"use client";

import { Button } from "@base-ui/react/button";
import { Input } from "@base-ui/react/input";
import { Menu } from "@base-ui/react/menu";
import { useState } from "react";
import type { Npc } from "@/app/admin/campaigns/_lib/types";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { LabelAction } from "@/components/label-action";
import { RowMenu } from "@/components/row-menu";
import { CARD, CARD_BODY, MENU_ITEM } from "@/components/styles";
import { useCampaign } from "../_hooks/use-campaign";
import { NpcStatusRow } from "./npc-status-row";
import { StoryTagList } from "./story-tag-list";

const STRIPE = "w-[3px] shrink-0 bg-quiet";

export function NpcCard({ npc, autoFocus }: { npc: Npc; autoFocus: boolean }) {
	const { dispatch } = useCampaign();
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [addedStatus, setAddedStatus] = useState<string | null>(null);
	const named = npc.name.trim() || "this NPC";

	function addStatus() {
		const id = crypto.randomUUID();
		dispatch({ type: "addNpcStatus", npcId: npc.id, id, valence: "positive" });
		setAddedStatus(id);
	}

	return (
		<article className={CARD}>
			<div aria-hidden="true" className={STRIPE} />
			<div className={CARD_BODY}>
				<div className="flex items-center justify-between gap-2">
					<div className="flex min-w-0 flex-1 flex-col gap-1">
						<span className="font-display text-[10px] font-semibold tracking-[0.17em] text-dim uppercase">
							NPC
						</span>
						<Input
							type="text"
							autoComplete="off"
							autoFocus={autoFocus}
							value={npc.name}
							onChange={(event) =>
								dispatch({
									type: "renameNpc",
									npcId: npc.id,
									name: event.target.value,
								})
							}
							aria-label="NPC name"
							placeholder="Unnamed"
							className="w-full min-w-0 bg-transparent font-display text-lg font-bold tracking-[0.05em] text-text uppercase placeholder:text-dim placeholder:normal-case"
						/>
					</div>

					<RowMenu label={`Menu for ${named}`}>
						<Menu.Item
							className={MENU_ITEM}
							onClick={() => setDeleteOpen(true)}
						>
							Delete
						</Menu.Item>
					</RowMenu>
				</div>

				<textarea
					value={npc.notes}
					onChange={(event) =>
						dispatch({
							type: "setNpcNotes",
							npcId: npc.id,
							notes: event.target.value,
						})
					}
					rows={2}
					aria-label={`Notes for ${named}`}
					placeholder="What this NPC wants, or what they know"
					className="min-h-11 resize-none rounded-sm border border-border bg-bg p-2.5 font-sans text-[13px] text-text placeholder:text-dim"
				/>

				<div className="flex flex-col gap-1.5">
					<LabelAction label="Statuses" onClick={addStatus}>
						+ Status
					</LabelAction>
					{npc.statuses.length === 0 ? (
						<p className="font-sans text-[13px] text-dim">No statuses.</p>
					) : (
						<ul className="flex flex-col gap-1.5">
							{npc.statuses.map((status) => (
								<NpcStatusRow
									key={status.id}
									npcId={npc.id}
									status={status}
									autoFocus={status.id === addedStatus}
								/>
							))}
						</ul>
					)}
				</div>

				<div className="flex flex-col gap-1.5">
					<StoryTagList tags={npc.storyTags} npcId={npc.id} collapsed />
				</div>
			</div>

			<ConfirmDialog
				open={deleteOpen}
				onOpenChange={setDeleteOpen}
				title={`Delete ${named}?`}
				description={`This deletes its ${npc.statuses.length} status${
					npc.statuses.length === 1 ? "" : "es"
				} and ${npc.storyTags.length} story tag${
					npc.storyTags.length === 1 ? "" : "s"
				}.`}
			>
				<Button
					type="button"
					onClick={() => {
						dispatch({ type: "removeNpc", npcId: npc.id });
						setDeleteOpen(false);
					}}
					className="inline-flex min-h-11 items-center self-start rounded-sm bg-danger px-4 font-display text-sm font-bold tracking-[0.08em] text-bg uppercase"
				>
					Delete
				</Button>
			</ConfirmDialog>
		</article>
	);
}
