"use client";

import { Menu } from "@base-ui/react/menu";
import { useState } from "react";
import { Chip } from "@/app/character/[id]/_components/chip";
import { ConfirmDialog } from "@/app/character/[id]/_components/confirm-dialog";
import { LABEL } from "@/app/character/[id]/_components/styles";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { isNascent, themeLine, themeTitle } from "@/lib/character/theme";
import type { Essence, GhostMemory } from "@/lib/character/types";
import {
	DECAY_TRACK_LENGTH,
	UPGRADE_TRACK_LENGTH,
} from "@/lib/rules/constants";
import { ESSENCES, essenceSuggestion } from "@/lib/rules/essence-suggestion";

const MENU_POPUP =
	"min-w-[190px] rounded-md border border-border bg-surface p-1 text-text shadow-lg outline-none";
const MENU_ITEM =
	"flex min-h-11 cursor-pointer items-center rounded-sm px-3 font-display text-sm font-semibold tracking-[0.08em] uppercase outline-none select-none data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary";

export function SheetMenu() {
	const [ghostsOpen, setGhostsOpen] = useState(false);
	const [essenceOpen, setEssenceOpen] = useState(false);

	return (
		<>
			<Menu.Root>
				<Menu.Trigger
					aria-label="Sheet menu"
					className="-m-1 flex size-11 shrink-0 items-center justify-center p-1 text-dim"
				>
					<svg
						aria-hidden="true"
						width="4"
						height="18"
						viewBox="0 0 4 18"
						fill="currentColor"
					>
						<circle cx="2" cy="2" r="2" />
						<circle cx="2" cy="9" r="2" />
						<circle cx="2" cy="16" r="2" />
					</svg>
				</Menu.Trigger>

				<Menu.Portal>
					<Menu.Positioner
						side="bottom"
						align="end"
						sideOffset={8}
						className="outline-none"
					>
						<Menu.Popup className={MENU_POPUP}>
							<Menu.Item
								className={MENU_ITEM}
								onClick={() => setGhostsOpen(true)}
							>
								Ghost Memories
							</Menu.Item>
							<Menu.Item
								className={MENU_ITEM}
								onClick={() => setEssenceOpen(true)}
							>
								Override Essence
							</Menu.Item>
						</Menu.Popup>
					</Menu.Positioner>
				</Menu.Portal>
			</Menu.Root>

			<ConfirmDialog
				open={ghostsOpen}
				onOpenChange={setGhostsOpen}
				title="Ghost Memories"
				cancelLabel="Close"
			>
				<GhostMemories />
			</ConfirmDialog>

			<ConfirmDialog
				open={essenceOpen}
				onOpenChange={setEssenceOpen}
				title="Override Essence"
				cancelLabel="Done"
			>
				<EssencePicker />
			</ConfirmDialog>
		</>
	);
}

/** The player can still pick or override ahead of the auto-assignment,
 *  or fix a tied mix it can't resolve on its own (reducer.ts's `addTheme` case). */
function EssencePicker() {
	const { character, dispatch } = useCharacter();
	const { candidates, warning } = essenceSuggestion(
		character.themes,
		character.essence,
	);
	const others = ESSENCES.filter((essence) => !candidates.includes(essence));

	const chip = (value: Essence) => (
		<label
			key={value}
			className={`inline-flex min-h-11 items-center gap-2 rounded-sm border px-3 font-display text-sm font-semibold tracking-[0.08em] uppercase ${
				character.essence === value
					? "border-primary text-text"
					: "border-border text-dim"
			}`}
		>
			<input
				type="radio"
				name="essence"
				value={value}
				checked={character.essence === value}
				onChange={() => dispatch({ type: "setEssence", essence: value })}
				className="size-[18px] accent-primary"
			/>
			{value}
		</label>
	);

	return (
		<div className="flex flex-col gap-3">
			<fieldset>
				<legend className={LABEL}>Essence</legend>

				<div className="flex flex-col gap-2 pt-1">
					<p className="font-sans text-sm text-dim">
						{candidates.length === 0
							? "Add a theme and the sheet suggests an Essence. Until then, choose one yourself."
							: candidates.length === 1
								? "Your themes suggest this. It assigns itself once you have 4 theme cards, unless you choose first."
								: "Your themes suggest one of these. The mix ties, so choose one yourself."}
					</p>

					{candidates.length > 0 && (
						<div className="flex flex-wrap gap-2">{candidates.map(chip)}</div>
					)}

					{warning && (
						<p className="font-sans text-sm text-negative-text">{warning}</p>
					)}

					<p className={LABEL}>
						{candidates.length > 0 ? "Other Essences" : "All Essences"}
					</p>
					<div className="flex flex-wrap gap-2">{others.map(chip)}</div>
				</div>
			</fieldset>

			<label className="flex flex-col gap-1">
				<span className={LABEL}>Essence special</span>
				<textarea
					value={character.essenceSpecial}
					onChange={(event) =>
						dispatch({
							type: "setEssenceSpecial",
							essenceSpecial: event.target.value,
						})
					}
					className="min-h-11 rounded-sm border border-border bg-surface p-3 font-sans text-base field-sizing-content"
				/>
			</label>
		</div>
	);
}

/** The archive players read back. Read-only, and never editable. */
function GhostMemories() {
	const { character } = useCharacter();

	if (character.ghostMemories.length === 0) {
		return <p className="font-sans text-sm text-dim">No ghost memories yet.</p>;
	}

	return (
		<div className="flex flex-col gap-4">
			{character.ghostMemories.map((memory) => (
				<GhostEntry key={memory.id} memory={memory} />
			))}
		</div>
	);
}

function GhostEntry({ memory }: { memory: GhostMemory }) {
	const { theme } = memory;
	const title = themeTitle(theme);

	return (
		<article
			data-type={theme.type}
			className="flex flex-col gap-1 border-l-2 border-[var(--hue)] pl-2"
		>
			<span className={LABEL}>
				{theme.themebook.trim() || "No themebook"} · {theme.type}
			</span>
			<h3 className="font-display text-[17px] leading-tight font-bold tracking-[0.05em] text-[var(--hue-title)] uppercase">
				{title?.text.trim() || "Untitled theme"}
			</h3>
			<p className="font-sans text-[13px] text-dim">
				{/* lazy: the UTC date, because this client component renders on the
            server too and a locale-formatted time would not survive hydration.
            Ceiling: a theme lost late at night reads as the next day. Upgrade
            path: format it in an effect, once the browser has the page. */}
				Lost <time dateTime={memory.lostAt}>{memory.lostAt.slice(0, 10)}</time>.{" "}
				{memory.reason.trim() || "No reason was written down."}
			</p>

			<details>
				<summary className="min-h-11 cursor-pointer content-center font-mono text-[10px] tracking-[0.08em] text-dim uppercase">
					Read it back
				</summary>

				<ul className="flex flex-wrap gap-1.5">
					{theme.powerTags.map((tag) => (
						<Chip
							key={tag.id}
							label={tag.letter}
							text={tag.text}
							burnt={tag.burnt}
						/>
					))}
					{theme.weaknessTags.map((tag) => (
						<Chip key={tag.id} label={tag.letter} text={tag.text} negative />
					))}
				</ul>

				{theme.quote.trim() && (
					<p className="pt-1 font-sans text-[13px] text-dim">
						{themeLine(theme.type)}: {theme.quote}
					</p>
				)}

				{theme.specials.map((special) => (
					<p key={special} className="pt-1 font-sans text-[13px] text-dim">
						{special}
					</p>
				))}

				<p className={`${LABEL} pt-1`}>
					{isNascent(theme) ? "Nascent · " : ""}
					Upgrade {theme.upgrade} of {UPGRADE_TRACK_LENGTH} · Decay{" "}
					{theme.decay} of {DECAY_TRACK_LENGTH}
				</p>
			</details>
		</article>
	);
}
