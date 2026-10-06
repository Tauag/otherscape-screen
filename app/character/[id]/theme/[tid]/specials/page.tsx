"use client";

import { Toggle } from "@base-ui/react/toggle";
import Link from "next/link";
import { use } from "react";
import {
	PickerFrame,
	ROW,
	ROW_TEXT,
} from "@/app/character/[id]/_components/picker";
import { FILLED } from "@/app/character/[id]/_components/styles";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { MissingTheme } from "@/app/character/[id]/theme/[tid]/_components/picker";
import { useContentPack } from "@/lib/content/load";
import { formatSpecial, specialsOf } from "@/lib/pickers";

const CARD =
	"flex h-full w-full flex-col gap-1.5 rounded-md border border-border bg-surface px-4 py-3 text-left transition-colors hover:border-[var(--hue)]/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-pressed:border-[var(--hue)] aria-pressed:bg-[var(--hue)]/7";

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
		<PickerFrame type={theme.type} title="Theme specials" wide>
			{specials.length === 0 ? (
				<p className="font-sans text-sm text-dim">
					{theme.themebook.trim()
						? `The content pack holds no themebook called ${theme.themebook}, so there are no specials to read.`
						: "This theme has no themebook yet, so there are no specials to read."}
				</p>
			) : (
				<>
					<p className="font-sans text-sm text-dim">
						The five {theme.themebook} specials. Choose one to take it, and
						choose it again to give it back.
					</p>

					<ul className="grid gap-2 lg:grid-cols-2 lg:gap-3 xl:grid-cols-3">
						{specials.map((special, index) => {
							const stored = formatSpecial(special);
							const taken = theme.specials.includes(stored);

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
										pressed={taken}
										onPressedChange={() => toggle(stored)}
										className={CARD}
									>
										<span className="flex items-baseline justify-between gap-3">
											<span className="font-display text-[15px] font-semibold tracking-[0.03em] text-[var(--hue-title)] uppercase">
												{special.name}
											</span>
											{taken && (
												<span className="shrink-0 font-mono text-[9px] font-bold tracking-[0.14em] text-[var(--hue)] uppercase">
													Taken ✓
												</span>
											)}
										</span>
										<span className="font-sans text-sm leading-relaxed text-dim">
											{special.text}
										</span>
									</Toggle>
								</li>
							);
						})}
					</ul>
				</>
			)}

			{/* Every toggle already autosaves, so Save is only the way back. */}
			<Link href={`/character/${id}/theme/${tid}`} className={FILLED}>
				Save
			</Link>
		</PickerFrame>
	);
}
