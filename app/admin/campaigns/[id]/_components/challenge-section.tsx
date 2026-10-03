"use client";

import { useState } from "react";
import { LabelAction } from "@/components/label-action";
import { useCampaign } from "../_hooks/use-campaign";
import { ChallengeCard } from "./challenge-card";

/** The main column's challenges section: design.md 8.2, canvas Campaign screen. */
export function ChallengeSection() {
	const { campaign, dispatch } = useCampaign();
	/** The card that opens focused on its name: the one this screen just added. */
	const [added, setAdded] = useState<string | null>(null);

	function addChallenge() {
		const id = crypto.randomUUID();
		dispatch({ type: "addChallenge", id });
		setAdded(id);
	}

	return (
		<div className="flex flex-col gap-3">
			<LabelAction
				label={`Challenges · ${campaign.challenges.length}`}
				onClick={addChallenge}
			>
				+ New Challenge
			</LabelAction>

			{campaign.challenges.length === 0 ? (
				<p className="font-sans text-sm text-dim">No challenges yet.</p>
			) : (
				<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
					{campaign.challenges.map((challenge) => (
						<ChallengeCard
							key={challenge.id}
							challenge={challenge}
							autoFocus={challenge.id === added}
						/>
					))}
				</div>
			)}
		</div>
	);
}
