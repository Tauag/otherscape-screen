"use client";

import { Button } from "@base-ui/react/button";
import { Toggle } from "@base-ui/react/toggle";
import { use, useState } from "react";
import {
	PickerFrame,
	ROW,
	ROW_TEXT,
} from "@/app/character/[id]/_components/picker";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { usePick } from "@/app/character/[id]/_hooks/use-pick";
import type { CharacterAction } from "@/app/character/[id]/_lib/reducer";
import {
	MissingTag,
	MissingTheme,
} from "@/app/character/[id]/theme/[tid]/_components/picker";
import { LABEL } from "@/components/styles";
import type { ThemeType } from "@/lib/character/types";
import { useContentPack } from "@/lib/content/load";
import {
	findThemebook,
	questionLabel,
	themebooksOfType,
} from "@/lib/content/pack";
import { answerCounts, powerQuestions, weaknessQuestions } from "@/lib/pickers";

const THEME_TYPES: ThemeType[] = ["self", "mythos", "noise"];

type Row = {
	label: string;
	text: string;
	count: number;
	action: CharacterAction;
};

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
	const counts = answerCounts(power ? theme.powerTags : theme.weaknessTags);

	const rows: Row[] = power
		? powerQuestions(pack, book).map((question) => ({
				label: question.letter,
				text: question.text || questionLabel("power", question.letter),
				count: counts[question.letter] ?? 0,
				action: {
					type: "editPowerTag",
					themeId: theme.id,
					tagId,
					edit: { letter: question.letter, themebook: book },
				},
			}))
		: weaknessQuestions(pack, book).map((question) => ({
				label: question.letter,
				text: question.text || questionLabel("weakness", question.letter),
				count: counts[question.letter] ?? 0,
				action: {
					type: "editWeaknessTag",
					themeId: theme.id,
					tagId,
					edit: { letter: question.letter },
				},
			}));

	const current = findThemebook(pack, book);
	const type = borrowType ?? theme.type;

	return (
		<PickerFrame
			backHref={`/character/${id}/theme/${tid}`}
			backLabel="Theme"
			type={theme.type}
			title={power ? "Power tag question" : "Weakness tag question"}
		>
			<p className="font-sans text-sm text-dim">
				Questions from {book || "no themebook yet"}. Most questions may be
				answered more than once.
			</p>

			<ul className="flex flex-col gap-2">
				{rows.map((row) => (
					<li key={row.label}>
						<Button
							type="button"
							onClick={() => pick(row.action)}
							className={ROW}
						>
							<span className="flex items-baseline gap-2">
								<span className="font-mono text-[13px] text-[var(--hue)]">
									{row.label}
								</span>
								<span className={ROW_TEXT}>{row.text}</span>
							</span>
							{row.count > 0 && (
								<span className={LABEL}>
									Already answered by {row.count}{" "}
									{row.count === 1 ? "tag" : "tags"}
								</span>
							)}
						</Button>
					</li>
				))}
			</ul>

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
