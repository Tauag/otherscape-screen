"use client";

import { useState } from "react";
import {
	SheetCard,
	SheetCardTitle,
} from "@/app/character/[id]/_components/sheet/sheet-card";
import {
	CardTracks,
	UpgradeDialog,
} from "@/app/character/[id]/_components/track";
import { CardLabel } from "@/components/card-label";
import {
	CrewTags,
	NascentBadge,
	QuoteLine,
	SpecialsList,
} from "@/components/card-parts";
import { CREW_THEME_ID, MOTIVATION_TYPE } from "@/lib/character/crew-theme";
import { decayFull } from "@/lib/character/loss";
import { isNascent, themeTitle } from "@/lib/character/theme";
import type { CrewRelationship, CrewTheme } from "@/lib/character/types";

export function CrewCard({
	crew,
	relationships,
	href,
}: {
	crew: CrewTheme;
	relationships: CrewRelationship[];
	href: string;
}) {
	const title = themeTitle(crew);
	const nascent = isNascent(crew);
	const [upgradeOpen, setUpgradeOpen] = useState(false);

	return (
		<>
			<SheetCard
				href={href}
				type={MOTIVATION_TYPE[crew.motivation]}
				faded={nascent}
			>
				<div className="flex items-center justify-between gap-2">
					<CardLabel tone={nascent ? "muted" : "dim"}>
						Crew · {crew.motivation}
					</CardLabel>

					<div className="flex items-center gap-3">
						{nascent && <NascentBadge />}
						<div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1.5">
							<CardTracks
								themeId={CREW_THEME_ID}
								card={crew}
								size="sm"
								onUpgrade={() => setUpgradeOpen(true)}
							/>
						</div>
					</div>
				</div>

				<SheetCardTitle
					text={title?.text}
					burnt={title?.burnt ?? false}
					nascent={nascent}
				/>
				<CrewTags crew={crew} relationships={relationships} />
				<QuoteLine label={crew.motivation} quote={crew.quote} />

				<SpecialsList specials={crew.specials} />

				{decayFull(crew) && (
					<p className="font-sans text-sm text-negative-text">
						The Decay track is full. Together, decide what this means for the
						crew.
					</p>
				)}
			</SheetCard>

			<UpgradeDialog
				themeId={CREW_THEME_ID}
				themeHref={href}
				nascent={nascent}
				open={upgradeOpen}
				onOpenChange={setUpgradeOpen}
			/>
		</>
	);
}
