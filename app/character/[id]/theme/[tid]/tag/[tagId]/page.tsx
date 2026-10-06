"use client";

import { Toggle } from "@base-ui/react/toggle";
import { use, useState } from "react";
import {
	PickerFrame,
	QuestionList,
	ROW,
} from "@/app/character/[id]/_components/picker";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { usePick } from "@/app/character/[id]/_hooks/use-pick";
import {
	MissingTag,
	MissingTheme,
} from "@/app/character/[id]/theme/[tid]/_components/picker";
import { LABEL } from "@/components/styles";
import { THEME_TYPES, type ThemeType } from "@/lib/character/types";
import { useContentPack } from "@/lib/content/load";
import { findThemebook, themebooksOfType } from "@/lib/content/pack";
import { powerQuestions, weaknessQuestions } from "@/lib/pickers";

export default function QuestionPicker({
	params,
}: PageProps<"/character/[id]/theme/[tid]/tag/[tagId]">) {
	const { id, tid, tagId } = use(params);
	const { character, dispatch } = useCharacter();
	const pack = useContentPack();
	const pick = usePick(`/character/${id}/theme/${tid}`);
	const [borrowType, setBorrowType] = useState<ThemeType | null>(null);

	const theme = character.themes.find((candidate) => candidate.id === tid);
	if (!theme) return <MissingTheme id={id} />;

	const power = theme.powerTags.find((tag) => tag.id === tagId);
	const weakness = theme.weaknessTags.find((tag) => tag.id === tagId);
	if (!power && !weakness) return <MissingTag id={id} tid={tid} />;

	// The tag's own themebook is the source of its questions, and a theme special
	// is what lets it differ from the theme's. A weakness tag never borrows.
	const book = (power?.themebook.trim() || theme.themebook).trim();
	const current = findThemebook(pack, book);
	const type = borrowType ?? theme.type;

	return (
		<PickerFrame
			type={theme.type}
			title={power ? "Power tag question" : "Weakness tag question"}
		>
			<p className="font-sans text-sm text-dim">
				Questions from {book || "no themebook yet"}. Most questions may be
				answered more than once.
			</p>

			{power ? (
				<QuestionList
					kind="power"
					questions={powerQuestions(pack, book)}
					tags={theme.powerTags}
					onPick={(letter) =>
						pick({
							type: "editPowerTag",
							themeId: theme.id,
							tagId,
							edit: { letter, themebook: book },
						})
					}
				/>
			) : (
				<QuestionList
					kind="weakness"
					questions={weaknessQuestions(pack, book)}
					tags={theme.weaknessTags}
					onPick={(letter) =>
						pick({
							type: "editWeaknessTag",
							themeId: theme.id,
							tagId,
							edit: { letter },
						})
					}
				/>
			)}

			{power && (
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
						A theme special can allow you to answer from another themebook. Pick
						one and its questions replace the list above.
					</p>
					<ul className="flex flex-col gap-2">
						{themebooksOfType(pack, type).map((candidate) => (
							<li key={candidate.id}>
								<Toggle
									pressed={current?.id === candidate.id}
									onPressedChange={() =>
										dispatch({
											type: "editPowerTag",
											themeId: theme.id,
											tagId,
											edit: { themebook: candidate.name },
										})
									}
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
			)}
		</PickerFrame>
	);
}
