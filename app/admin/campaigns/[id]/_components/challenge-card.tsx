"use client";

import { Button } from "@base-ui/react/button";
import { Input } from "@base-ui/react/input";
import { Menu } from "@base-ui/react/menu";
import { useState } from "react";
import type { Challenge } from "@/app/admin/campaigns/_lib/types";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ArrowDownIcon } from "@/components/icons";
import { LabelAction } from "@/components/label-action";
import { RowMenu } from "@/components/row-menu";
import { CARD, CARD_BODY, LABEL, MENU_ITEM } from "@/components/styles";
import { useCampaign } from "../_hooks/use-campaign";
import { ChallengeSpecialRow } from "./challenge-special-row";
import { ChallengeStatusRow } from "./challenge-status-row";
import { StoryTagList } from "./story-tag-list";

const STRIPE = "w-[3px] shrink-0 bg-quiet";

/** The collapsed line: each status as `name-tier`, then counts. */
function summarize(challenge: Challenge): string {
	const statuses = challenge.statuses
		.filter((status) => status.name.trim())
		.map((status) => `${status.name}-${status.tiers.lastIndexOf(true) + 1}`);
	const counts = [
		[challenge.storyTags.length, "tag"],
		[challenge.specials.length, "special"],
	]
		.filter(([count]) => count)
		.map(([count, noun]) => `${count} ${noun}${count === 1 ? "" : "s"}`);
	return [...statuses, ...counts].join(" · ");
}

/**
 * A challenge, open or collapsed to its name and summary. A benched card
 * collapses at every width. A scene card collapses only below md (phone
 * prep): from md up it is always open, for play.
 *
 * Open-ness is CSS classes, not Base UI Collapsible: Collapsible hides its
 * panel with the `hidden` attribute, which Tailwind's preflight forces to
 * `display: none !important`, so `md:` can't reopen a scene card.
 */
export function ChallengeCard({
	challenge,
	autoFocus,
	open,
	onOpenChange,
}: {
	challenge: Challenge;
	autoFocus: boolean;
	open: boolean;
	onOpenChange: (open: boolean) => void;
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

	const scene = challenge.inScene;
	const summary = summarize(challenge);

	return (
		<article className={CARD}>
			<div aria-hidden="true" className={STRIPE} />
			<div className={CARD_BODY}>
				<div className="flex items-center justify-between gap-2">
					<Button
						type="button"
						aria-expanded={open}
						aria-label={open ? `Collapse ${named}` : `Expand ${named}`}
						onClick={() => onOpenChange(!open)}
						className={`-my-3 -ml-2 flex size-11 shrink-0 items-center justify-center text-dim ${
							scene ? "md:hidden" : ""
						}`}
					>
						<span
							aria-hidden="true"
							className={`transition-transform ${open ? "rotate-90" : ""}`}
						>
							▸
						</span>
					</Button>
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

					{/* The bench sits below the scene, so down benches and up returns. */}
					<Button
						type="button"
						aria-label={scene ? `Bench ${named}` : `Add ${named} to scene`}
						title={scene ? "Bench" : "Add to scene"}
						onClick={() =>
							dispatch({
								type: "setChallengeInScene",
								challengeId: challenge.id,
								inScene: !scene,
							})
						}
						className="-my-3 flex size-11 shrink-0 items-center justify-center text-dim"
					>
						<ArrowDownIcon className={scene ? "" : "rotate-180"} />
					</Button>
					<RowMenu label={`Menu for ${named}`}>
						<Menu.Item
							className={MENU_ITEM}
							onClick={() => setDeleteOpen(true)}
						>
							Delete
						</Menu.Item>
					</RowMenu>
				</div>

				{summary && (
					<p
						className={`${LABEL} truncate ${open ? "hidden" : scene ? "md:hidden" : ""}`}
					>
						{summary}
					</p>
				)}

				{/* `contents` keeps CARD_BODY's gap between the sections. */}
				<div
					className={
						open ? "contents" : scene ? "hidden md:contents" : "hidden"
					}
				>
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
						<span className={LABEL}>Story tags</span>
						<StoryTagList
							tags={challenge.storyTags}
							challengeId={challenge.id}
						/>
					</div>
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
