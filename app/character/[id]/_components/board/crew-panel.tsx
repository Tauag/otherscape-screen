"use client";

import { Button } from "@base-ui/react/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
	EditLink,
	EMPTY_SHELL,
	HEADER_LABEL,
	PanelQuote,
	SHELL,
	SpecialsList,
	type TagChip,
	TagList,
} from "@/app/character/[id]/_components/board/panel-shell";
import { ConfirmDialog } from "@/app/character/[id]/_components/confirm-dialog";
import { FILLED } from "@/app/character/[id]/_components/styles";
import { TrackPips } from "@/app/character/[id]/_components/track";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import type { RollGroup } from "@/app/character/[id]/_lib/roll-selection";
import { crewTitle, isCrewNascent } from "@/lib/character/crew-theme";
import type { CrewTheme } from "@/lib/character/types";
import {
	DECAY_TRACK_LENGTH,
	UPGRADE_TRACK_LENGTH,
} from "@/lib/rules/constants";

export function CrewPanel({
	crewTheme,
	group,
	tagChip,
	id,
}: {
	crewTheme: CrewTheme;
	group: RollGroup;
	tagChip: TagChip;
	id: string;
}) {
	const { dispatch } = useCharacter();
	const router = useRouter();
	const [upgradeOpen, setUpgradeOpen] = useState(false);
	const href = `/character/${id}/crew`;
	const empty = group.tags.length === 0;
	const nascent = isCrewNascent(crewTheme);

	function markUpgrade() {
		const willComplete = crewTheme.upgrade + 1 >= UPGRADE_TRACK_LENGTH;
		dispatch({ type: "markCrewTrack", track: "upgrade" });
		if (willComplete) setUpgradeOpen(true);
	}

	function markDecay() {
		dispatch({ type: "markCrewTrack", track: "decay" });
	}

	function takeTag() {
		const tagId = crypto.randomUUID();
		dispatch({ type: "addCrewPowerTag", id: tagId, letter: "A" });
		setUpgradeOpen(false);
		router.push(`${href}#tag-${tagId}`);
	}

	function takeSpecial() {
		setUpgradeOpen(false);
		router.push(`${href}/specials`);
	}

	return (
		<section data-type="crew" className={empty ? EMPTY_SHELL : SHELL}>
			<div className="flex items-center justify-between gap-2">
				<span className={HEADER_LABEL}>Crew</span>
				<div className="flex items-center gap-3">
					<TrackPips
						name="Upgrade"
						short="UPG"
						length={UPGRADE_TRACK_LENGTH}
						marked={crewTheme.upgrade}
						size="sm"
						active
						onMark={markUpgrade}
					/>
					<TrackPips
						name="Decay"
						short="DEC"
						length={DECAY_TRACK_LENGTH}
						marked={crewTheme.decay}
						size="sm"
						active={false}
						onMark={markDecay}
					/>
					<EditLink
						href={href}
						label={`Edit ${crewTitle(crewTheme)?.text.trim() || "the crew theme"}`}
					/>
				</div>
			</div>

			{empty ? (
				<p className="font-sans text-sm text-dim">Nothing built yet.</p>
			) : (
				<TagList group={group} tagChip={tagChip} />
			)}

			<PanelQuote label={crewTheme.motivation} quote={crewTheme.quote} />

			<SpecialsList specials={crewTheme.specials} />

			<ConfirmDialog
				open={upgradeOpen}
				onOpenChange={setUpgradeOpen}
				title="Take an Upgrade"
				description={
					nascent
						? "Three points, one Upgrade. A nascent crew theme takes a new power tag until it has all three."
						: "Three points, one Upgrade. Take a new power tag, which may answer any question, or a crew theme special."
				}
			>
				<Button type="button" onClick={takeTag} className={FILLED}>
					+ power tag
				</Button>
				{!nascent && (
					<Button type="button" onClick={takeSpecial} className={FILLED}>
						+ crew theme special
					</Button>
				)}
			</ConfirmDialog>
		</section>
	);
}
