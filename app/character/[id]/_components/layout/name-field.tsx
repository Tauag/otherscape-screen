"use client";

import { Input } from "@base-ui/react/input";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";

/** The character's name, edited in place in the app bar. `className` sets
 *  the label's hit area. */
export function NameField({ className }: { className: string }) {
	const { character, dispatch } = useCharacter();

	return (
		// biome-ignore lint/a11y/noLabelWithoutControl: Base UI's Input renders a real <input> inside this label; biome can't see through the component boundary.
		<label className={`flex items-center ${className}`}>
			<span className="sr-only">Name</span>
			<Input
				value={character.name}
				autoComplete="off"
				onChange={(event) =>
					dispatch({ type: "rename", name: event.target.value })
				}
				placeholder="Unnamed"
				className="w-full min-w-0 bg-transparent font-display text-[17px] leading-none font-bold tracking-[0.05em] text-text uppercase placeholder:text-dim"
			/>
		</label>
	);
}
