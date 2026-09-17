"use client";

import { Button } from "@base-ui/react/button";
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
import { MissingCrewTag } from "@/app/character/[id]/crew/_components/picker";
import { useContentPack } from "@/lib/content/load";
import { questionLabel } from "@/lib/content/pack";
import {
	answerCounts,
	crewPowerQuestions,
	crewWeaknessQuestions,
} from "@/lib/pickers";

type Row = {
	label: string;
	text: string;
	count: number;
	action: CharacterAction;
};

export default function CrewQuestionPicker({
	params,
}: PageProps<"/character/[id]/crew/tag/[tagId]">) {
	const { id, tagId } = use(params);
	const { character } = useCharacter();
	const pack = useContentPack();
	const pick = usePick(`/character/${id}/crew`);

	const { crewTheme: crew } = character;
	const power = crew.powerTags.find((tag) => tag.id === tagId);
	const weakness = crew.weaknessTags.find((tag) => tag.id === tagId);
	if (!power && !weakness) return <MissingCrewTag id={id} />;

	const counts = answerCounts(power ? crew.powerTags : crew.weaknessTags);

	const rows: Row[] = power
		? crewPowerQuestions(pack).map((question) => ({
				label: question.letter,
				text: question.text || questionLabel("power", question.letter),
				count: counts[question.letter] ?? 0,
				action: {
					type: "editCrewPowerTag",
					tagId,
					edit: { letter: question.letter },
				},
			}))
		: crewWeaknessQuestions(pack).map((question) => ({
				label: question.letter,
				text: question.text || questionLabel("weakness", question.letter),
				count: counts[question.letter] ?? 0,
				action: {
					type: "editCrewWeaknessTag",
					tagId,
					edit: { letter: question.letter },
				},
			}));

	return (
		<PickerFrame
			backHref={`/character/${id}/crew`}
			backLabel="Crew theme"
			type="crew"
			title={power ? "Power tag question" : "Weakness tag question"}
		>
			<p className="font-sans text-sm text-dim">
				The crew theme's own questions. Every one stays on offer, so a question
				may be answered more than once.
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
		</PickerFrame>
	);
}
