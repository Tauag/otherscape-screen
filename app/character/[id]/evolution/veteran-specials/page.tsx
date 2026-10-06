"use client";

import {
	PickerFrame,
	SpecialGrid,
} from "@/app/character/[id]/_components/picker";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { useContentPack } from "@/lib/content/load";
import { veteranSpecialsOf } from "@/lib/pickers";

export default function VeteranSpecialsPicker() {
	const { character, dispatch } = useCharacter();
	const pack = useContentPack();
	const toggle = (special: string) =>
		dispatch(
			character.veteranSpecials.includes(special)
				? { type: "removeVeteranSpecial", special }
				: { type: "addVeteranSpecial", special },
		);

	return (
		<PickerFrame title="Veteran specials" wide>
			<SpecialGrid
				specials={veteranSpecialsOf(pack)}
				taken={character.veteranSpecials}
				onToggle={toggle}
				slot="Veteran special"
			/>
		</PickerFrame>
	);
}
