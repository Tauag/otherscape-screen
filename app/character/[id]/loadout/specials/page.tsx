"use client";

import { Toggle } from "@base-ui/react/toggle";
import {
	PickerFrame,
	ROW,
	ROW_TEXT,
} from "@/app/character/[id]/_components/picker";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { useContentPack } from "@/lib/content/load";
import { formatSpecial, loadoutSpecialsOf } from "@/lib/pickers";

export default function LoadoutSpecialsPicker() {
	const { character, dispatch } = useCharacter();
	const { loadout } = character;
	const pack = useContentPack();
	const specials = loadoutSpecialsOf(pack);

	// Taken one at a time and given back the same way, so a mis-tap is not
	// final - the same rule as the theme specials picker this flow reuses.
	const toggle = (special: string) =>
		dispatch(
			loadout.specials.includes(special)
				? { type: "removeLoadoutSpecial", special }
				: { type: "addLoadoutSpecial", special },
		);

	return (
		<PickerFrame title="Loadout specials">
			<p className="font-sans text-sm text-dim">
				The eight loadout specials. Tap one to take it, and tap it again to give
				it back.
			</p>

			<ul className="flex flex-col gap-2">
				{specials.map((special, index) => {
					const stored = formatSpecial(special);

					// An empty pack slot stays visible, same as a theme special: there is
					// nothing to store yet, so the slot is a line rather than a choice.
					if (stored === "") {
						return (
							// biome-ignore lint/suspicious/noArrayIndexKey: an unloaded pack fills every slot with the same blank special, so index is what the label reads.
							<li key={index} className={`${ROW} border-dashed`}>
								<span className={ROW_TEXT}>
									Loadout special {index + 1}. The content pack has not been
									uploaded.
								</span>
							</li>
						);
					}

					return (
						// biome-ignore lint/suspicious/noArrayIndexKey: specials come from a fixed content-pack list that is never reordered.
						<li key={index}>
							<Toggle
								pressed={loadout.specials.includes(stored)}
								onPressedChange={() => toggle(stored)}
								className={ROW}
							>
								<span className="font-display text-[15px] font-semibold tracking-[0.03em] text-[var(--hue-title,var(--color-text))] uppercase">
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
