"use client";

import { use } from "react";
import {
	Missing,
	PickerFrame,
	QuestionList,
} from "@/app/character/[id]/_components/picker";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { usePick } from "@/app/character/[id]/_hooks/use-pick";
import { CREW_THEME_ID, MOTIVATION_TYPE } from "@/lib/character/crew-theme";
import { useContentPack } from "@/lib/content/load";
import { crewPowerQuestions, crewWeaknessQuestions } from "@/lib/pickers";

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
	if (!power && !weakness)
		return (
			<Missing
				href={`/character/${id}/crew`}
				label="Back to the crew theme"
				sentence="The crew theme has no such tag. It may have been deleted."
			/>
		);

	return (
		<PickerFrame
			type={MOTIVATION_TYPE[crew.motivation]}
			title={power ? "Power tag question" : "Weakness tag question"}
		>
			<p className="font-sans text-sm text-dim">
				The crew theme's own questions. Most questions may be answered more than
				once.
			</p>

			{power ? (
				<QuestionList
					kind="power"
					questions={crewPowerQuestions(pack)}
					tags={crew.powerTags}
					onPick={(letter) =>
						pick({
							type: "editPowerTag",
							themeId: CREW_THEME_ID,
							tagId,
							edit: { letter },
						})
					}
				/>
			) : (
				<QuestionList
					kind="weakness"
					questions={crewWeaknessQuestions(pack)}
					tags={crew.weaknessTags}
					onPick={(letter) =>
						pick({
							type: "editWeaknessTag",
							themeId: CREW_THEME_ID,
							tagId,
							edit: { letter },
						})
					}
				/>
			)}
		</PickerFrame>
	);
}
