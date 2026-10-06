"use client";

import { use } from "react";
import { SaveLink } from "@/app/character/[id]/_components/editor";
import {
	PickerFrame,
	SpecialGrid,
} from "@/app/character/[id]/_components/picker";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { useContentPack } from "@/lib/content/load";
import { loadoutSpecialsOf } from "@/lib/pickers";

export default function LoadoutSpecialsPicker({
	params,
}: PageProps<"/character/[id]/loadout/specials">) {
	const { id } = use(params);
	const { character, dispatch } = useCharacter();
	const { loadout } = character;
	const pack = useContentPack();

	const toggle = (special: string) =>
		dispatch(
			loadout.specials.includes(special)
				? { type: "removeLoadoutSpecial", special }
				: { type: "addLoadoutSpecial", special },
		);

	return (
		<PickerFrame type="loadout" title="Loadout specials" wide>
			<p className="font-sans text-sm text-dim">
				The eight loadout specials. Choose one to take it, and choose it again
				to give it back.
			</p>

			<SpecialGrid
				specials={loadoutSpecialsOf(pack)}
				taken={loadout.specials}
				onToggle={toggle}
				slot="Loadout special"
			/>

			<SaveLink href={`/character/${id}/loadout`} />
		</PickerFrame>
	);
}
