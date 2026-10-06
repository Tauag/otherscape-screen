"use client";

import { useState } from "react";
import { DecayWarning } from "@/app/character/[id]/_components/decay-warning";
import {
	LoseThemeButton,
	LoseThemeDialog,
} from "@/app/character/[id]/_components/lose-theme";
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
import { decayFull } from "@/lib/character/loss";
import { isNascent, themeLine, themeTitle } from "@/lib/character/theme";
import type { Theme } from "@/lib/character/types";

export function ThemeCard({ theme, href }: { theme: Theme; href: string }) {
	const title = themeTitle(theme);
	const nascent = isNascent(theme);
	const named = title?.text.trim() || "this theme";
	const [upgradeOpen, setUpgradeOpen] = useState(false);
	const [loseOpen, setLoseOpen] = useState(false);

	return (
		<>
			<SheetCard href={href} type={theme.type} faded={nascent}>
				<div className="flex items-center justify-between gap-2">
					<SheetCardLabel faded={nascent}>
						{theme.type} · {theme.themebook.trim() || "No themebook"}
					</SheetCardLabel>

					<div className="flex items-center gap-3">
						{nascent && <NascentBadge />}
						<div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1.5">
							<CardTracks
								themeId={theme.id}
								card={theme}
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
				<TagChips theme={theme} />
				<QuoteLine label={themeLine(theme.type)} quote={theme.quote} />
				<SpecialsList specials={theme.specials} />

				{decayFull(theme) && (
					<>
						<DecayWarning />
						<LoseThemeButton named={named} onOpen={() => setLoseOpen(true)} />
					</>
				)}
			</SheetCard>

			{/* Both dialogs sit outside the Link: a portalled dialog leaves the DOM
          but stays in the React tree, so under the Link its clicks navigate. */}
			<UpgradeDialog
				themeId={theme.id}
				themeHref={href}
				nascent={nascent}
				open={upgradeOpen}
				onOpenChange={setUpgradeOpen}
			/>
			{decayFull(theme) && (
				<LoseThemeDialog
					themeId={theme.id}
					named={named}
					open={loseOpen}
					onOpenChange={setLoseOpen}
				/>
			)}
		</>
	);
}
