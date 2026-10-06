"use client";

import { Input } from "@base-ui/react/input";
import { Select } from "@base-ui/react/select";
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
import { ROW } from "@/app/character/[id]/_components/picker";
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
import { LABEL } from "@/components/styles";
import { decayFull } from "@/lib/character/loss";
import { isNascent, themeLine, themeTitle } from "@/lib/character/theme";
import type { ThemeType } from "@/lib/character/types";
import { useContentPack } from "@/lib/content/load";
import { findThemebook, themebooksOfType } from "@/lib/content/pack";

const THEME_TYPES: ThemeType[] = ["self", "mythos", "noise"];

const POPUP =
	"z-40 max-h-[70vh] w-[var(--anchor-width)] overflow-y-auto rounded-sm border border-border bg-surface p-1.5 outline-none";
const TYPE_ITEM =
	"flex min-h-11 cursor-pointer items-center rounded-sm px-3 font-display text-sm font-semibold tracking-[0.08em] text-dim uppercase outline-none data-[highlighted]:bg-bg data-[selected]:text-[var(--hue)]";
const THEMEBOOK_TRIGGER =
	"flex min-h-11 flex-1 items-center justify-between gap-2 bg-bg px-3 text-left";
const THEMEBOOK_POPUP =
	"z-40 max-h-[75vh] w-[min(92vw,380px)] overflow-y-auto rounded-sm border border-border bg-surface p-2 outline-none";
const THEMEBOOK_ITEM = `${ROW} cursor-pointer border-[var(--hue)] outline-none data-[highlighted]:border-dim data-[selected]:border-[var(--hue)]`;

export default function ThemePage({
	params,
}: PageProps<"/character/[id]/theme/[tid]">) {
	const { id, tid } = use(params);
	const { character, dispatch } = useCharacter();
	const router = useRouter();
	const pack = useContentPack();

	const theme = character.themes.find((candidate) => candidate.id === tid);
	const chosenBook = theme ? findThemebook(pack, theme.themebook) : null;
	const [themebookOpen, setThemebookOpen] = useState(false);
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
					<section className="flex divide-x divide-[var(--hue)] overflow-hidden rounded-sm border border-[var(--hue)]">
						<Select.Root
							value={theme.type}
							onValueChange={(themeType) => {
								if (themeType)
									dispatch({
										type: "setThemeType",
										themeId: theme.id,
										themeType,
									});
							}}
						>
							<Select.Trigger className="flex min-h-11 min-w-30 shrink-0 items-center justify-center gap-1.5 bg-bg px-4 font-display text-sm font-semibold tracking-[0.08em] text-[var(--hue)] uppercase">
								{theme.type}
								<Select.Icon aria-hidden className="text-xs">
									▾
								</Select.Icon>
							</Select.Trigger>
							<Select.Portal>
								<Select.Positioner sideOffset={4} align="start">
									<Select.Popup className={POPUP}>
										<Select.List>
											{THEME_TYPES.map((value) => (
												<Select.Item
													key={value}
													value={value}
													className={TYPE_ITEM}
												>
													<Select.ItemText>{value}</Select.ItemText>
												</Select.Item>
											))}
										</Select.List>
									</Select.Popup>
								</Select.Positioner>
							</Select.Portal>
						</Select.Root>

						<Select.Root
							open={themebookOpen}
							onOpenChange={(open) => {
								setThemebookOpen(open);
							}}
							value={chosenBook?.name ?? null}
							onValueChange={(themebook) => {
								if (themebook)
									dispatch({
										type: "setThemebook",
										themeId: theme.id,
										themebook,
									});
							}}
						>
							<Select.Trigger
								aria-label={`Themebook: ${theme.themebook.trim() || "none yet"}. Tap to change.`}
								className={THEMEBOOK_TRIGGER}
							>
								<span
									className={
										theme.themebook.trim()
											? "truncate font-display text-sm font-semibold tracking-[0.08em] text-[var(--hue)] uppercase"
											: "font-sans text-base text-dim"
									}
								>
									{theme.themebook.trim() || "Choose a themebook"}
								</span>
								<Select.Icon aria-hidden className="shrink-0 text-xs text-dim">
									▾
								</Select.Icon>
							</Select.Trigger>
							<Select.Portal>
								<Select.Positioner sideOffset={4} align="start">
									<Select.Popup className={THEMEBOOK_POPUP}>
										<Select.List className="flex flex-col gap-1.5">
											{themebooksOfType(pack, theme.type).map((book) => (
												<Select.Item
													key={book.id}
													value={book.name}
													className={THEMEBOOK_ITEM}
												>
													<Select.ItemText className="font-display text-[15px] font-semibold tracking-[0.03em] text-[var(--hue-title)] uppercase">
														{book.name}
													</Select.ItemText>
												</Select.Item>
											))}
										</Select.List>
									</Select.Popup>
								</Select.Positioner>
							</Select.Portal>
						</Select.Root>
					</section>

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
