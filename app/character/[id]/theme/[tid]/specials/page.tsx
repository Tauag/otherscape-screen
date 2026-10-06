"use client";

import { use } from "react";
import { SaveLink } from "@/app/character/[id]/_components/editor";
import {
	PickerFrame,
	SpecialGrid,
} from "@/app/character/[id]/_components/picker";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { MissingTheme } from "@/app/character/[id]/theme/[tid]/_components/picker";
import { useContentPack } from "@/lib/content/load";
import { specialsOf } from "@/lib/pickers";

export default function SpecialsPicker({
	params,
}: PageProps<"/character/[id]/theme/[tid]/specials">) {
	const { id, tid } = use(params);
	const { character, dispatch } = useCharacter();
	const pack = useContentPack();

	const theme = character.themes.find((candidate) => candidate.id === tid);
	if (!theme) return <MissingTheme id={id} />;

	const specials = specialsOf(pack, theme.themebook);
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

					<SpecialGrid
						specials={specials}
						taken={theme.specials}
						onToggle={toggle}
						slot="Theme special"
					/>
				</>
			)}

			<SaveLink href={`/character/${id}/theme/${tid}`} />
		</PickerFrame>
	);
}
