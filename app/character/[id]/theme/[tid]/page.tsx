"use client";

import { Input } from "@base-ui/react/input";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { DecayWarning } from "@/app/character/[id]/_components/decay-warning";
import {
	EDITOR_ASIDE,
	EDITOR_COLUMN,
	EDITOR_GRID,
	EDITOR_HEADER,
	EDITOR_HEADING,
	EDITOR_PAGE,
	EDITOR_TITLE,
	EDITOR_TRACKS,
	FIELD,
	PANEL,
	SaveLink,
} from "@/app/character/[id]/_components/editor";
import {
	LoseThemeButton,
	LoseThemeDialog,
} from "@/app/character/[id]/_components/lose-theme";
import {
	TagSections,
	ThemeSpecialsPanel,
} from "@/app/character/[id]/_components/tag-sections";
import {
	CardTracks,
	UpgradeDialog,
} from "@/app/character/[id]/_components/track";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { MissingTheme } from "@/app/character/[id]/theme/[tid]/_components/picker";
import { ThemebookSelect } from "@/app/character/[id]/theme/[tid]/_components/themebook-select";
import { LABEL } from "@/components/styles";
import { decayFull } from "@/lib/character/loss";
import { isNascent, themeLine, themeTitle } from "@/lib/character/theme";

export default function ThemePage({
	params,
}: PageProps<"/character/[id]/theme/[tid]">) {
	const { id, tid } = use(params);
	const { character, dispatch } = useCharacter();
	const router = useRouter();

	const theme = character.themes.find((candidate) => candidate.id === tid);
	const [upgradeOpen, setUpgradeOpen] = useState(false);
	const [loseOpen, setLoseOpen] = useState(false);

	const back = `/character/${id}`;
	const here = `${back}/theme/${tid}`;

	if (!theme) return <MissingTheme id={id} />;

	const title = themeTitle(theme);
	const nascent = isNascent(theme);

	return (
		<main data-type={theme.type} className={EDITOR_PAGE}>
			<header className={EDITOR_HEADER}>
				<div className={EDITOR_HEADING}>
					<ThemebookSelect theme={theme} />

					<h1
						data-burnt={title?.burnt ? "true" : undefined}
						className={`${EDITOR_TITLE} ${title?.burnt ? "line-through" : ""}`}
					>
						{title?.text.trim() || "Untitled theme"}
					</h1>
				</div>

				<section className={EDITOR_TRACKS}>
					<CardTracks
						themeId={theme.id}
						card={theme}
						size="lg"
						onUpgrade={() => setUpgradeOpen(true)}
					/>
				</section>
			</header>

			<UpgradeDialog
				themeId={theme.id}
				themeHref={here}
				nascent={nascent}
				open={upgradeOpen}
				onOpenChange={setUpgradeOpen}
			/>

			<div className={EDITOR_GRID}>
				<div className={EDITOR_COLUMN}>
					<TagSections themeId={theme.id} card={theme} here={here} />
				</div>

				<aside className={EDITOR_ASIDE}>
					<label htmlFor={`theme-quote-${theme.id}`} className={PANEL}>
						<span className={LABEL}>{themeLine(theme.type)}</span>
						<Input
							id={`theme-quote-${theme.id}`}
							type="text"
							autoComplete="off"
							value={theme.quote}
							onChange={(event) =>
								dispatch({
									type: "setThemeQuote",
									themeId: theme.id,
									quote: event.target.value,
								})
							}
							placeholder={`Create your ${themeLine(theme.type)}`}
							className={FIELD}
						/>
					</label>

					<ThemeSpecialsPanel
						themeId={theme.id}
						specials={theme.specials}
						here={here}
					/>

					<section className="flex flex-col gap-2 pb-2 lg:pb-0">
						<div className="flex gap-3.5">
							<SaveLink href={back} />
							<LoseThemeButton
								named={title?.text.trim() || "this theme"}
								onOpen={() => setLoseOpen(true)}
							/>
						</div>
						{decayFull(theme) && <DecayWarning />}
						<LoseThemeDialog
							themeId={theme.id}
							named={title?.text.trim() || "this theme"}
							open={loseOpen}
							onOpenChange={setLoseOpen}
							onLost={() => router.replace(back)}
						/>
					</section>
				</aside>
			</div>
		</main>
	);
}
