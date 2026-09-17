"use client";

import { Button } from "@base-ui/react/button";
import { Input } from "@base-ui/react/input";
import { Menu } from "@base-ui/react/menu";
import { MENU_ITEM } from "@/app/character/[id]/_components/styles";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { RowMenu } from "@/app/character/[id]/play/_components/row-menu";
import type { Status } from "@/lib/character/types";

// lazy: field-sizing keeps the input as wide as the name, so the tier reads as
// part of it. Where a browser lacks it the input keeps its default width and
// the tier sits further right; nothing else changes.
const NAME =
	"min-w-[7ch] max-w-full bg-transparent font-display tracking-[0.04em] placeholder:text-dim field-sizing-content";
const STEP =
	"grid size-11 shrink-0 place-items-center self-center rounded-sm font-display text-[22px]";
const BOX = "h-2.5 w-[26px]";
const LIT = `${BOX} bg-[var(--hue)] shadow-[0_0_8px_color-mix(in_oklab,var(--hue)_55%,transparent)]`;
const UNLIT = `${BOX} border border-[var(--hue)]/30`;

export function StatusCard({
	status,
	autoFocus,
}: {
	status: Status;
	/** True for the card the player just added, so the name takes the caret. */
	autoFocus: boolean;
}) {
	const { dispatch } = useCharacter();
	const tier = status.tiers.lastIndexOf(true) + 1;
	const named = status.name.trim() || "this status";

	const name = (className: string) => (
		<Input
			type="text"
			value={status.name}
			autoFocus={autoFocus}
			onChange={(event) =>
				dispatch({
					type: "renameStatus",
					id: status.id,
					name: event.target.value,
				})
			}
			aria-label="Status name"
			placeholder="Name it"
			className={`${NAME} ${className}`}
		/>
	);

	const menu = (className: string) => (
		<RowMenu label={`Menu for ${named}`} className={className}>
			<Menu.Item
				className={MENU_ITEM}
				onClick={() => dispatch({ type: "toggleStatusOut", id: status.id })}
			>
				{status.out ? "Bring it back" : "Mark it out"}
			</Menu.Item>
			<Menu.Item
				className={MENU_ITEM}
				onClick={() => dispatch({ type: "toggleStatusOwner", id: status.id })}
			>
				{status.owner === "mine" ? "Mark as the MC's" : "Make it mine"}
			</Menu.Item>
			<Menu.Item
				className={MENU_ITEM}
				onClick={() =>
					dispatch({
						type: "setStatusValence",
						id: status.id,
						valence: status.valence === "positive" ? "negative" : "positive",
					})
				}
			>
				{status.valence === "positive"
					? "Make it negative"
					: "Make it positive"}
			</Menu.Item>
			<Menu.Item
				className={MENU_ITEM}
				onClick={() => dispatch({ type: "removeStatus", id: status.id })}
			>
				Delete
			</Menu.Item>
		</RowMenu>
	);

	if (status.out) {
		return (
			<li className="flex items-center gap-2.5 rounded-[5px] border border-dashed border-border bg-recess px-3 py-2.5">
				{name("text-[15px] text-faint line-through")}
				<span className="shrink-0 font-display text-[15px] tracking-[0.04em] text-faint line-through">
					-{tier}
				</span>
				<span className="ml-auto shrink-0 border border-badge px-1.5 py-[3px] font-mono text-[9px] font-bold tracking-[0.1em] text-muted">
					OUT
				</span>
				{menu("")}
			</li>
		);
	}

	return (
		<li
			data-valence={status.valence}
			className="flex items-stretch gap-2 rounded-[5px] border border-[var(--hue)]/30 border-l-[3px] border-l-[var(--hue)] bg-surface py-2 pr-2 pl-2.5"
		>
			<div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
				<div className="flex items-center gap-[7px]">
					{name("text-base font-semibold text-[var(--hue-text)]")}
					<span className="shrink-0 font-display text-base font-semibold tracking-[0.04em] text-[var(--hue-text)]">
						-{tier}
					</span>
					{status.owner === "mc" && (
						<span className="shrink-0 border border-[var(--hue)]/30 px-[5px] py-0.5 font-mono text-[8px] font-bold tracking-[0.1em] text-[var(--hue)]/70">
							MC
						</span>
					)}
					{menu("ml-auto")}
				</div>

				<span
					role="img"
					aria-label={`Tier ${tier}`}
					className="flex gap-1 overflow-hidden"
				>
					{status.tiers.map((marked, index) => (
						<span
							// biome-ignore lint/suspicious/noArrayIndexKey: a fixed-length tier track, position is the identity.
							key={index}
							aria-hidden="true"
							className={marked ? LIT : UNLIT}
						/>
					))}
				</span>
			</div>

			<Button
				type="button"
				onClick={() => dispatch({ type: "lowerStatus", id: status.id })}
				aria-label={`Lower ${named} a tier`}
				className={`${STEP} border border-[var(--hue)]/30 text-[var(--hue)]/70`}
			>
				<span aria-hidden>−</span>
			</Button>
			<Button
				type="button"
				onClick={() => dispatch({ type: "raiseStatus", id: status.id })}
				aria-label={`Raise ${named} a tier`}
				className={`${STEP} border border-[var(--hue)] bg-[var(--hue)]/12 text-[var(--hue-text)]`}
			>
				<span aria-hidden>+</span>
			</Button>
		</li>
	);
}
