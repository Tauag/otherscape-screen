"use client";

import { RosterAppBar } from "@/components/roster-app-bar";
import { LABEL } from "@/components/styles";
import { useCampaign } from "../_hooks/use-campaign";
import { SAVE_STATUS_MESSAGE } from "./campaign-provider";
import { NpcSection } from "./npc-section";
import { StoryTagList } from "./story-tag-list";

/**
 * The campaign screen (design.md 8.2): campaign name and notes, then NPCs,
 * then the story tags aside. Assigned characters (T67) are a later section
 * of this same grid - not built yet, so this leaves no placeholder for it.
 */
export function CampaignScreen({ accountName }: { accountName: string }) {
	const { campaign, dispatch, status, parked } = useCampaign();

	return (
		<main className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
			<RosterAppBar
				title={campaign.name.trim() || "Unnamed"}
				accountName={accountName}
				isAdmin
				status={
					<p
						role="status"
						aria-live="polite"
						className={`font-mono text-[10px] tracking-[0.08em] uppercase ${
							status === "conflict" ? "text-negative-text" : "text-faint"
						}`}
					>
						{SAVE_STATUS_MESSAGE[status]}
					</p>
				}
			/>

			{parked && (
				<p className="px-5 pb-2 font-sans text-[11px] text-dim">
					The copy you did not keep stays in this browser, under the storage key{" "}
					<code className="font-mono text-faint">{parked}</code>.
				</p>
			)}

			<div className="grid flex-1 gap-6 px-5 pb-8 lg:grid-cols-[minmax(0,1fr)_340px]">
				<div className="flex min-w-0 flex-col gap-5">
					<label className="flex flex-col gap-1">
						<span className={LABEL}>Campaign name</span>
						<input
							value={campaign.name}
							onChange={(event) =>
								dispatch({ type: "rename", name: event.target.value })
							}
							placeholder="Unnamed"
							className="min-h-11 rounded-sm border border-border bg-bg px-3 font-display text-base text-text placeholder:text-dim"
						/>
					</label>

					<label className="flex flex-col gap-1">
						<span className={LABEL}>Campaign notes</span>
						<textarea
							value={campaign.notes}
							onChange={(event) =>
								dispatch({ type: "setNotes", notes: event.target.value })
							}
							rows={4}
							placeholder="What the GM needs to remember at the table"
							className="min-h-11 resize-none rounded-sm border border-border bg-bg p-3 font-sans text-sm text-text placeholder:text-dim"
						/>
					</label>

					<NpcSection />
				</div>

				<aside className="flex min-w-0 flex-col gap-2">
					<div className="flex items-center justify-between gap-2">
						<span className={LABEL}>
							Story tags · {campaign.storyTags.length}
						</span>
						<span className={LABEL}>Not on any sheet</span>
					</div>
					<StoryTagList tags={campaign.storyTags} />
				</aside>
			</div>
		</main>
	);
}
