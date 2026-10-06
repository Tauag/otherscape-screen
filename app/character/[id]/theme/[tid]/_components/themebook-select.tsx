"use client";

import { Select } from "@base-ui/react/select";
import { ROW } from "@/app/character/[id]/_components/picker";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { THEME_TYPES, type Theme } from "@/lib/character/types";
import { useContentPack } from "@/lib/content/load";
import { findThemebook, themebooksOfType } from "@/lib/content/pack";

const POPUP =
	"z-40 max-h-[70vh] w-[var(--anchor-width)] overflow-y-auto rounded-sm border border-border bg-surface p-1.5 outline-none";
const TYPE_ITEM =
	"flex min-h-11 cursor-pointer items-center rounded-sm px-3 font-display text-sm font-semibold tracking-[0.08em] text-dim uppercase outline-none data-[highlighted]:bg-bg data-[selected]:text-[var(--hue)]";
const THEMEBOOK_TRIGGER =
	"flex min-h-11 flex-1 items-center justify-between gap-2 bg-bg px-3 text-left";
const THEMEBOOK_POPUP =
	"z-40 max-h-[75vh] w-[min(92vw,380px)] overflow-y-auto rounded-sm border border-border bg-surface p-2 outline-none";
const THEMEBOOK_ITEM = `${ROW} cursor-pointer border-[var(--hue)] outline-none data-[highlighted]:border-dim data-[selected]:border-[var(--hue)]`;

/** The theme editor's type and themebook pickers, joined as one control. */
export function ThemebookSelect({ theme }: { theme: Theme }) {
	const { dispatch } = useCharacter();
	const pack = useContentPack();
	const chosenBook = findThemebook(pack, theme.themebook);

	return (
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
									<Select.Item key={value} value={value} className={TYPE_ITEM}>
										<Select.ItemText>{value}</Select.ItemText>
									</Select.Item>
								))}
							</Select.List>
						</Select.Popup>
					</Select.Positioner>
				</Select.Portal>
			</Select.Root>

			<Select.Root
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
	);
}
