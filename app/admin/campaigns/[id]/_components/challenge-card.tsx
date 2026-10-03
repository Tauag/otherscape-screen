"use client";

import { Button } from "@base-ui/react/button";
import { Input } from "@base-ui/react/input";
import { Menu } from "@base-ui/react/menu";
import { useState } from "react";
import type { Challenge } from "@/app/admin/campaigns/_lib/types";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { LabelAction } from "@/components/label-action";
import { RowMenu } from "@/components/row-menu";
import { CARD, CARD_BODY, MENU_ITEM } from "@/components/styles";
import { useCampaign } from "../_hooks/use-campaign";
import { ChallengeSpecialRow } from "./challenge-special-row";
import { ChallengeStatusRow } from "./challenge-status-row";
import { StoryTagList } from "./story-tag-list";

const STRIPE = "w-[3px] shrink-0 bg-quiet";

export function ChallengeCard({
	challenge,
	autoFocus,
}: {
	challenge: Challenge;
	autoFocus: boolean;
}) {
	const { dispatch } = useCampaign();
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [addedStatus, setAddedStatus] = useState<string | null>(null);
	const [addedSpecial, setAddedSpecial] = useState<string | null>(null);
	const named = challenge.name.trim() || "this challenge";

	function addStatus() {
		const id = crypto.randomUUID();
		dispatch({
			type: "addChallengeStatus",
			challengeId: challenge.id,
			id,
			valence: "positive",
		});
		setAddedStatus(id);
	}

	function addSpecial() {
		const id = crypto.randomUUID();
		dispatch({ type: "addChallengeSpecial", challengeId: challenge.id, id });
		setAddedSpecial(id);
	}

	return (
		<article className={CARD}>
			<div aria-hidden="true" className={STRIPE} />
			<div className={CARD_BODY}>
				<div className="flex items-center justify-between gap-2">
					<div className="flex min-w-0 flex-1 flex-col gap-1">
						<Input
							type="text"
							autoComplete="off"
							autoFocus={autoFocus}
							value={challenge.name}
							onChange={(event) =>
								dispatch({
									type: "renameChallenge",
									challengeId: challenge.id,
									name: event.target.value,
								})
							}
							aria-label="Challenge name"
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
					value={challenge.notes}
					onChange={(event) =>
						dispatch({
							type: "setChallengeNotes",
							challengeId: challenge.id,
							notes: event.target.value,
						})
					}
					rows={2}
					aria-label={`Notes for ${named}`}
					placeholder="What this challenge wants, or what they know"
					className="min-h-11 resize-none rounded-sm border border-border bg-bg p-2.5 font-sans text-[13px] text-text placeholder:text-dim"
				/>

				<div className="flex flex-col gap-1.5">
					<LabelAction label="Statuses" onClick={addStatus}>
						+ Status
					</LabelAction>
					{challenge.statuses.length === 0 ? (
						<p className="font-sans text-[13px] text-dim">No statuses.</p>
					) : (
						<ul className="flex flex-col gap-1.5">
							{challenge.statuses.map((status) => (
								<ChallengeStatusRow
									key={status.id}
									challengeId={challenge.id}
									status={status}
									autoFocus={status.id === addedStatus}
								/>
							))}
						</ul>
					)}
				</div>

				<div className="flex flex-col gap-1.5">
					<LabelAction label="Specials" onClick={addSpecial}>
						+ Special
					</LabelAction>
					{challenge.specials.length === 0 ? (
						<p className="font-sans text-[13px] text-dim">No specials.</p>
					) : (
						<ul className="flex flex-col gap-1.5">
							{challenge.specials.map((special) => (
								<ChallengeSpecialRow
									key={special.id}
									challengeId={challenge.id}
									special={special}
									autoFocus={special.id === addedSpecial}
								/>
							))}
						</ul>
					)}
				</div>

				<div className="flex flex-col gap-1.5">
					<StoryTagList
						tags={challenge.storyTags}
						challengeId={challenge.id}
						collapsed
					/>
				</div>
			</div>

			<ConfirmDialog
				open={deleteOpen}
				onOpenChange={setDeleteOpen}
				title={`Delete ${named}?`}
				description={`This deletes its ${challenge.statuses.length} status${
					challenge.statuses.length === 1 ? "" : "es"
				}, ${challenge.specials.length} special${
					challenge.specials.length === 1 ? "" : "s"
				}, and ${challenge.storyTags.length} story tag${
					challenge.storyTags.length === 1 ? "" : "s"
				}.`}
			>
				<Button
					type="button"
					onClick={() => {
						dispatch({ type: "removeChallenge", challengeId: challenge.id });
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
