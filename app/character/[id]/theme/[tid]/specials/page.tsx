"use client";

import { Toggle } from "@base-ui/react/toggle";
import { use, useState } from "react";
import { SaveLink } from "@/app/character/[id]/_components/editor";
import {
	PickerFrame,
	ROW,
	SpecialGrid,
} from "@/app/character/[id]/_components/picker";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { MissingTheme } from "@/app/character/[id]/theme/[tid]/_components/picker";
import { LABEL } from "@/components/styles";
import { THEME_TYPES, type ThemeType } from "@/lib/character/types";
import { useContentPack } from "@/lib/content/load";
import { findThemebook, themebooksOfType } from "@/lib/content/pack";
import { specialsOf } from "@/lib/pickers";

export default function SpecialsPicker({
	params,
}: PageProps<"/character/[id]/theme/[tid]/specials">) {
	const { id, tid } = use(params);
	const { character, dispatch } = useCharacter();
	const pack = useContentPack();
	const [borrowBook, setBorrowBook] = useState<string | null>(null);
	const [borrowType, setBorrowType] = useState<ThemeType | null>(null);

	const theme = character.themes.find((candidate) => candidate.id === tid);
	if (!theme) return <MissingTheme id={id} />;

	// A special can be taken from any themebook. Browsing another book changes
	// the grid, and taking from it saves the special's source type.
	const book = borrowBook ?? theme.themebook;
	const current = findThemebook(pack, book);
	const type = borrowType ?? current?.type ?? theme.type;
	const specials = specialsOf(pack, book);
	const toggle = (special: string) =>
		dispatch(
			theme.specials.includes(special)
				? { type: "removeThemeSpecial", themeId: theme.id, special }
				: {
						type: "addThemeSpecial",
						themeId: theme.id,
						special,
						from: current?.type !== theme.type ? current?.type : undefined,
					},
		);

	return (
		<PickerFrame type={current?.type ?? theme.type} title="Theme specials" wide>
			{specials.length === 0 ? (
				<p className="font-sans text-sm text-dim">
					{theme.themebook.trim()
						? `The content pack holds no themebook called ${theme.themebook}, so there are no specials to read.`
						: "This theme has no themebook yet, so there are no specials to read."}
				</p>
			) : (
				<>
					<p className="font-sans text-sm text-dim">
						The five {book} specials. Choose one to take it, and choose it again
						to give it back.
					</p>

					<SpecialGrid
						specials={specials}
						taken={theme.specials}
						onToggle={toggle}
						slot="Theme special"
					/>
				</>
			)}

			<section className="flex flex-col gap-2">
				<div className="flex items-center justify-between gap-2">
					<h2 className={LABEL}>Another themebook</h2>
					<div className="flex gap-1">
						{THEME_TYPES.map((candidateType) => (
							<Toggle
								key={candidateType}
								pressed={type === candidateType}
								onPressedChange={() => setBorrowType(candidateType)}
								data-type={candidateType}
								className="rounded-sm border border-border px-2 py-1 font-mono text-[10px] tracking-[0.08em] text-dim uppercase aria-pressed:border-[var(--hue)] aria-pressed:text-[var(--hue-title)]"
							>
								{candidateType}
							</Toggle>
						))}
					</div>
				</div>
				<p className="font-sans text-sm text-dim">
					Some rules let you take a special from another themebook. Pick one and
					its specials replace the list above.
				</p>
				<ul className="flex flex-col gap-2">
					{themebooksOfType(pack, type).map((candidate) => (
						<li key={candidate.id}>
							<Toggle
								pressed={current?.id === candidate.id}
								onPressedChange={() => setBorrowBook(candidate.name)}
								data-type={candidate.type}
								className={ROW}
							>
								<span className="font-display text-[15px] font-semibold tracking-[0.03em] text-[var(--hue-title)] uppercase">
									{candidate.name}
								</span>
							</Toggle>
						</li>
					))}
				</ul>
			</section>

			<SaveLink href={`/character/${id}/theme/${tid}`} />
		</PickerFrame>
	);
}
