"use client";

import { Toggle } from "@base-ui/react/toggle";
import { use } from "react";
import {
	PickerFrame,
	ROW,
	ROW_TEXT,
} from "@/app/character/[id]/_components/picker";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { MissingTheme } from "@/app/character/[id]/theme/[tid]/_components/picker";
import { useContentPack } from "@/lib/content/load";
import { formatSpecial, specialsOf } from "@/lib/pickers";

export default function SpecialsPicker({
	params,
}: PageProps<"/character/[id]/theme/[tid]/specials">) {
	const { id, tid } = use(params);
	const { character, dispatch } = useCharacter();
	const pack = useContentPack();

	const theme = character.themes.find((candidate) => candidate.id === tid);
	if (!theme) return <MissingTheme id={id} />;

	const specials = specialsOf(pack, theme.themebook);
	// Taken one at a time and given back the same way, so a mis-tap is not final.
	// The route stays put on a tap, unlike the two pickers that set one value.
	const toggle = (special: string) =>
		dispatch(
			theme.specials.includes(special)
				? { type: "removeThemeSpecial", themeId: theme.id, special }
				: { type: "addThemeSpecial", themeId: theme.id, special },
		);

	return (
		<PickerFrame type={theme.type} title="Theme specials">
			{specials.length === 0 ? (
				<p className="font-sans text-sm text-dim">
					{theme.themebook.trim()
						? `The content pack holds no themebook called ${theme.themebook}, so there are no specials to read.`
						: "This theme has no themebook yet, so there are no specials to read."}
				</p>
			) : (
				<>
					<p className="font-sans text-sm text-dim">
						The five {theme.themebook} specials. Tap one to take it, and tap it
						again to give it back.
					</p>

					<ul className="flex flex-col gap-2">
						{specials.map((special, index) => {
							const stored = formatSpecial(special);

							if (stored === "") {
								return (
									// biome-ignore lint/suspicious/noArrayIndexKey: an unloaded pack fills every slot with the same blank special, so index is what the label reads.
									<li key={index} className={`${ROW} border-dashed`}>
										<span className={ROW_TEXT}>
											Theme special {index + 1}. The content pack has not been
											uploaded.
										</span>
									</li>
								);
							}

							return (
								// biome-ignore lint/suspicious/noArrayIndexKey: specials come from a fixed content-pack list that is never reordered.
								<li key={index}>
									<Toggle
										pressed={theme.specials.includes(stored)}
										onPressedChange={() => toggle(stored)}
										className={ROW}
									>
										<span className="font-display text-[15px] font-semibold tracking-[0.03em] text-[var(--hue-title)] uppercase">
											{special.name}
										</span>
										<span className={ROW_TEXT}>{special.text}</span>
									</Toggle>
								</li>
							);
						})}
					</ul>
				</>
			)}
		</PickerFrame>
	);
}
