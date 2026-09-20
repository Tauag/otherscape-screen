"use client";

import { Toggle } from "@base-ui/react/toggle";
import { use } from "react";
import {
	PickerFrame,
	ROW,
	ROW_TEXT,
} from "@/app/character/[id]/_components/picker";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { useContentPack } from "@/lib/content/load";
import { formatSpecial, veteranSpecialsOf } from "@/lib/pickers";

export default function VeteranSpecialsPicker({
	params,
}: PageProps<"/character/[id]/evolution/veteran-specials">) {
	const { id } = use(params);
	const { character, dispatch } = useCharacter();
	const pack = useContentPack();
	const specials = veteranSpecialsOf(pack);
	const toggle = (special: string) =>
		dispatch(
			character.veteranSpecials.includes(special)
				? { type: "removeVeteranSpecial", special }
				: { type: "addVeteranSpecial", special },
		);

	return (
		<PickerFrame title="Veteran specials">
			<ul className="flex flex-col gap-2">
				{specials.map((special, index) => {
					const stored = formatSpecial(special);

					if (stored === "") {
						return (
							// biome-ignore lint/suspicious/noArrayIndexKey: an unloaded pack fills every slot with the same blank special, so index is what the label reads.
							<li key={index} className={`${ROW} border-dashed`}>
								<span className={ROW_TEXT}>
									Veteran special {index + 1}. The content pack has not been
									uploaded.
								</span>
							</li>
						);
					}

					return (
						// biome-ignore lint/suspicious/noArrayIndexKey: specials come from a fixed content-pack list that is never reordered.
						<li key={index}>
							<Toggle
								pressed={character.veteranSpecials.includes(stored)}
								onPressedChange={() => toggle(stored)}
								className={ROW}
							>
								<span className="font-display text-[15px] font-semibold tracking-[0.03em] text-text uppercase">
									{special.name}
								</span>
								<span className={ROW_TEXT}>{special.text}</span>
							</Toggle>
						</li>
					);
				})}
			</ul>
		</PickerFrame>
	);
}
