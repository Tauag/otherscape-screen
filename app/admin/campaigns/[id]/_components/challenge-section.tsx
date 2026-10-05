"use client";

import { useState } from "react";
import { LabelAction } from "@/components/label-action";
import { LABEL } from "@/components/styles";
import { useCampaign } from "../_hooks/use-campaign";
import { ChallengeCard } from "./challenge-card";

const GRID =
	"grid items-start gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4";

/** Challenges split into the current scene and the bench. */
export function ChallengeSection() {
	const { campaign, dispatch } = useCampaign();
	/** The card that opens focused on its name: the one this screen just added. */
	const [added, setAdded] = useState<string | null>(null);
	/** The one open collapsible card. Opening another closes it. */
	const [open, setOpen] = useState<string | null>(null);

	function addChallenge() {
		const id = crypto.randomUUID();
		dispatch({ type: "addChallenge", id });
		setAdded(id);
		setOpen(id);
	}

	const scene = campaign.challenges.filter((challenge) => challenge.inScene);
	const bench = campaign.challenges.filter((challenge) => !challenge.inScene);

	function cards(challenges: typeof campaign.challenges) {
		return (
			<div className={GRID}>
				{challenges.map((challenge) => (
					<ChallengeCard
						key={challenge.id}
						challenge={challenge}
						autoFocus={challenge.id === added}
						open={challenge.id === open}
						onOpenChange={(next) => setOpen(next ? challenge.id : null)}
					/>
				))}
			</div>
		);
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
				<>
					<section aria-label="In scene" className="flex flex-col gap-2">
						<h3 className={LABEL}>In scene · {scene.length}</h3>
						{scene.length === 0 ? (
							<p className="font-sans text-sm text-dim">
								Nothing in the scene. Add a challenge from the bench.
							</p>
						) : (
							cards(scene)
						)}
					</section>

					{bench.length > 0 && (
						<section aria-label="Bench" className="flex flex-col gap-2">
							<h3 className={LABEL}>Bench · {bench.length}</h3>
							{cards(bench)}
						</section>
					)}
				</>
			)}
		</div>
	);
}
