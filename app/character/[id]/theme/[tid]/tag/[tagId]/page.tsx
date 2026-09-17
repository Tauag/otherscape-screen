"use client";

import { Button } from "@base-ui/react/button";
import { Toggle } from "@base-ui/react/toggle";
import { use } from "react";
import {
	PickerFrame,
	ROW,
	ROW_TEXT,
} from "@/app/character/[id]/_components/picker";
import { LABEL } from "@/app/character/[id]/_components/styles";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { usePick } from "@/app/character/[id]/_hooks/use-pick";
import type { CharacterAction } from "@/app/character/[id]/_lib/reducer";
import {
	MissingTag,
	MissingTheme,
} from "@/app/character/[id]/theme/[tid]/_components/picker";
import { useContentPack } from "@/lib/content/load";
import { findThemebook, questionLabel } from "@/lib/content/pack";
import { answerCounts, powerQuestions, weaknessQuestions } from "@/lib/pickers";

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

	return (
		<PickerFrame
			backHref={`/character/${id}/theme/${tid}`}
			backLabel="Theme"
			type={theme.type}
			title={power ? "Power tag question" : "Weakness tag question"}
		>
			<p className="font-sans text-sm text-dim">
				Questions from {book || "no themebook yet"}. Every one stays on offer,
				so a question may be answered more than once.
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
								{row.count > 0 && (
									<span className={LABEL}>
										Already answered by {row.count}{" "}
										{row.count === 1 ? "tag" : "tags"}
									</span>
								)}
							</span>
							<span className={ROW_TEXT}>{row.text}</span>
						</Button>
					</li>
				))}
			</ul>

			{power && (
				<section className="flex flex-col gap-2">
					<h2 className={LABEL}>Another themebook</h2>
					<p className="font-sans text-sm text-dim">
						A theme special can send this tag to another themebook. Pick one and
						its questions replace the list above.
					</p>
					{/* lazy: every themebook is offered, because the special that grants
              the borrow is free text the app cannot read. Ceiling: the player has
              to know their own special. Upgrade path: filter this list once the
              pack carries specials as data rather than prose. */}
					<ul className="flex flex-col gap-2">
						{pack.themebooks.map((candidate) => (
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
									className={ROW}
								>
									<span className="font-display text-[15px] font-semibold tracking-[0.03em] text-[var(--hue-title)] uppercase">
										{candidate.name}
									</span>
									<span className={ROW_TEXT}>{candidate.concept}</span>
								</Toggle>
							</li>
						))}
					</ul>
				</section>
			)}
		</PickerFrame>
	);
}
