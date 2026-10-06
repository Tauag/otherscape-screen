"use client";

import { useState } from "react";
import {
	SheetCard,
	SheetCardLabel,
	SheetCardTitle,
} from "@/app/character/[id]/_components/sheet/sheet-card";
import {
	CardTracks,
	UpgradeDialog,
} from "@/app/character/[id]/_components/track";
import {
	NascentBadge,
	QuoteLine,
	SpecialsList,
	TagChips,
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
					<SheetCardLabel faded={nascent}>
						Crew · {crew.motivation}
					</SheetCardLabel>

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
				<TagChips theme={crew} />
				<QuoteLine label={crew.motivation} quote={crew.quote} />

				{relationships.length > 0 && (
					<ul className="flex flex-col gap-1">
						{relationships.map((relationship) => (
							<li
								key={relationship.id}
								className={`font-sans text-[13px] text-dim ${relationship.burnt ? "line-through" : ""}`}
							>
								<span className="text-[var(--hue-text)]">
									{relationship.member.trim() || "Unnamed"}
								</span>
								{relationship.tag.trim() && ` — ${relationship.tag}`}
							</li>
						))}
					</ul>
				)}

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
