"use client";

import { use } from "react";
import { SaveLink } from "@/app/character/[id]/_components/editor";
import {
	PickerFrame,
	SpecialGrid,
} from "@/app/character/[id]/_components/picker";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { CREW_THEME_ID, MOTIVATION_TYPE } from "@/lib/character/crew-theme";
import { useContentPack } from "@/lib/content/load";
import { crewSpecialsOf } from "@/lib/pickers";

export default function CrewSpecialsPicker({
	params,
}: PageProps<"/character/[id]/crew/specials">) {
	const { id } = use(params);
	const { character, dispatch } = useCharacter();
	const { crewTheme: crew } = character;
	const pack = useContentPack();

	const toggle = (special: string) =>
		dispatch(
			crew.specials.includes(special)
				? { type: "removeThemeSpecial", themeId: CREW_THEME_ID, special }
				: { type: "addThemeSpecial", themeId: CREW_THEME_ID, special },
		);

	return (
		<PickerFrame
			type={MOTIVATION_TYPE[crew.motivation]}
			title="Crew theme specials"
			wide
		>
			<p className="font-sans text-sm text-dim">
				The five crew theme specials. Choose one to take it, and choose it again
				to give it back.
			</p>

			<SpecialGrid
				specials={crewSpecialsOf(pack)}
				taken={crew.specials}
				onToggle={toggle}
				slot="Crew theme special"
			/>

			<SaveLink href={`/character/${id}/crew`} />
		</PickerFrame>
	);
}
