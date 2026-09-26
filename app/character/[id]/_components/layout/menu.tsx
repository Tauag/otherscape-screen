"use client";

import { Button } from "@base-ui/react/button";
import { Input } from "@base-ui/react/input";
import { Menu } from "@base-ui/react/menu";
import Link from "next/link";
import { useState } from "react";
import {
	DANGER,
	PRIMARY,
	SMALL_BUTTON,
} from "@/app/character/[id]/_components/styles";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { Chip } from "@/components/chip";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { MoreIcon } from "@/components/icons";
import { LABEL, MENU_ITEM, MENU_POPUP } from "@/components/styles";
import { generateShareLink, revokeShareLink } from "@/lib/actions";
import { isNascent, themeLine, themeTitle } from "@/lib/character/theme";
import type { Character, Essence, GhostMemory } from "@/lib/character/types";
import {
	DECAY_TRACK_LENGTH,
	UPGRADE_TRACK_LENGTH,
} from "@/lib/rules/constants";
import { ESSENCES, essenceSuggestion } from "@/lib/rules/essence-suggestion";

export function SheetMenu({
	shareToken,
	id,
}: {
	shareToken: string | null;
	id: string;
}) {
	const { character } = useCharacter();
	const [ghostsOpen, setGhostsOpen] = useState(false);
	const [essenceOpen, setEssenceOpen] = useState(false);
	const [shareOpen, setShareOpen] = useState(false);

	return (
		<>
			<Menu.Root>
				<Menu.Trigger
					aria-label="Sheet menu"
					className="-m-1 flex size-11 shrink-0 items-center justify-center p-1 text-dim"
				>
					<MoreIcon />
				</Menu.Trigger>

				<Menu.Portal>
					<Menu.Positioner
						side="bottom"
						align="end"
						sideOffset={8}
						className="outline-none"
					>
						<Menu.Popup className={MENU_POPUP}>
							<Menu.Item className={MENU_ITEM} render={<Link href="/" />}>
								See all characters
							</Menu.Item>
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
							<Menu.Item
								className={MENU_ITEM}
								onClick={() => setShareOpen(true)}
							>
								Share
							</Menu.Item>
							<Menu.Item
								className={MENU_ITEM}
								onClick={() => exportCharacter(character)}
							>
								Export
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
				cancelLabel="Close"
			>
				<EssencePicker />
			</ConfirmDialog>

			<ConfirmDialog
				open={shareOpen}
				onOpenChange={setShareOpen}
				title="Share"
				cancelLabel="Close"
			>
				<ShareControls id={id} initialToken={shareToken} />
			</ConfirmDialog>
		</>
	);
}

function exportCharacter(character: Character) {
	const blob = new Blob([JSON.stringify(character, null, 2)], {
		type: "application/json",
	});
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = `${(character.name.trim() || "character").replace(/[\\/:*?"<>|]/g, "-")}.json`;
	anchor.click();
	URL.revokeObjectURL(url);
}

/** A read-only link, generated on demand and revocable at any time. Re-sharing
 *  issues a new token, so an old link dies (sysdesign 4). */
function ShareControls({
	id,
	initialToken,
}: {
	id: string;
	initialToken: string | null;
}) {
	const [token, setToken] = useState(initialToken);
	const [pending, setPending] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);

	const link =
		token && typeof window !== "undefined"
			? `${window.location.origin}/s/${token}`
			: null;

	async function withPending(
		action: () => Promise<{
			token: string | null;
			error: string | null;
		}>,
	) {
		setPending(true);
		setError(null);
		setCopied(false);
		const result = await action();
		setPending(false);
		if (result.error) setError(result.error);
		else setToken(result.token);
	}

	function generate() {
		const form = new FormData();
		form.set("id", id);
		void withPending(() =>
			generateShareLink({ token: null, error: null }, form),
		);
	}

	function revoke() {
		const form = new FormData();
		form.set("id", id);
		void withPending(() => revokeShareLink({ token: null, error: null }, form));
	}

	async function copy() {
		if (!link) return;
		await navigator.clipboard.writeText(link);
		setCopied(true);
	}

	return (
		<div className="flex flex-col gap-3">
			<p className="font-sans text-sm text-dim">
				{link
					? "Anyone with this link opens a read-only copy of this sheet. No account needed, and they cannot edit it."
					: "Generate a read-only link for this character. Nobody can edit through it."}
			</p>

			{link && (
				<div className="flex items-center gap-2">
					{/* biome-ignore lint/a11y/noLabelWithoutControl: Base UI's Input renders a real <input> inside this label. */}
					<label className="flex min-h-11 w-full items-center">
						<span className="sr-only">Share link</span>
						<Input
							readOnly
							autoComplete="off"
							value={link}
							onFocus={(event) => event.target.select()}
							className="w-full min-w-0 rounded-sm border border-border bg-bg px-2 font-mono text-xs text-dim"
						/>
					</label>
					<Button type="button" onClick={copy} className={SMALL_BUTTON}>
						{copied ? "Copied" : "Copy"}
					</Button>
				</div>
			)}

			{error && <p className="font-sans text-sm text-negative-text">{error}</p>}

			<div className="flex gap-2">
				{link ? (
					<Button
						type="button"
						onClick={revoke}
						disabled={pending}
						className={DANGER}
					>
						Revoke link
					</Button>
				) : (
					<Button
						type="button"
						onClick={generate}
						disabled={pending}
						className={PRIMARY}
					>
						Generate link
					</Button>
				)}
			</div>
		</div>
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
		</div>
	);
}

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
