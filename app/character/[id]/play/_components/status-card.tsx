"use client";

import { Button } from "@base-ui/react/button";
import { Input } from "@base-ui/react/input";
import { Menu } from "@base-ui/react/menu";
import { Toggle } from "@base-ui/react/toggle";
import { useState } from "react";
import { MENU_ITEM } from "@/app/character/[id]/_components/styles";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { RowMenu } from "@/app/character/[id]/play/_components/row-menu";
import { StatusLimitDialog } from "@/app/character/[id]/play/_components/status-limit-dialog";
import type { Status } from "@/lib/character/types";

const NAME =
	"min-w-[7ch] max-w-full bg-transparent font-display tracking-[0.04em] placeholder:text-dim field-sizing-content";
const BOX = "h-3.5 w-9";
const LIT = `${BOX} bg-[var(--hue)] shadow-[0_0_8px_color-mix(in_oklab,var(--hue)_55%,transparent)]`;
const UNLIT = `${BOX} border border-[var(--hue)]/30`;

export function StatusCard({
	status,
	autoFocus,
	selected,
	onToggle,
}: {
	status: Status;
	autoFocus: boolean;
	selected?: boolean;
	onToggle?: () => void;
}) {
	const { dispatch } = useCharacter();
	const [limitOpen, setLimitOpen] = useState(false);
	const tier = status.tiers.lastIndexOf(true) + 1;
	const named = status.name.trim() || "this status";
	const stopForToggle = onToggle
		? (event: { stopPropagation: () => void }) => event.stopPropagation()
		: undefined;

	const name = (className: string) => (
		<Input
			type="text"
			autoComplete="off"
			value={status.name}
			autoFocus={autoFocus}
			onClick={stopForToggle}
			onChange={(event) =>
				dispatch({
					type: "renameStatus",
					id: status.id,
					name: event.target.value,
				})
			}
			aria-label="Status name"
			placeholder="Name this status"
			className={`${NAME} ${className}`}
		/>
	);

	const menu = (className: string) => (
		<RowMenu label={`Menu for ${named}`} className={className}>
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
			<Menu.Item className={MENU_ITEM} onClick={() => setLimitOpen(true)}>
				Change tier limit
			</Menu.Item>
			<Menu.Item
				className={MENU_ITEM}
				onClick={() => dispatch({ type: "removeStatus", id: status.id })}
			>
				Delete
			</Menu.Item>
		</RowMenu>
	);

	const limitDialog = (
		<StatusLimitDialog
			named={named}
			limit={status.limit}
			open={limitOpen}
			onOpenChange={setLimitOpen}
			onChoose={(limit) => {
				dispatch({ type: "setStatusLimit", id: status.id, limit });
				setLimitOpen(false);
			}}
		/>
	);

	const body = (
		<>
			<div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
				{name("text-base font-semibold text-[var(--hue-text)]")}

				<fieldset
					aria-label={`Tier, ${tier} of ${status.limit} marked`}
					className="m-0 flex flex-wrap gap-1.5 border-0 p-0"
				>
					{status.tiers.map((marked, index) => {
						const tierNumber = index + 1;
						return (
							<Button
								// biome-ignore lint/suspicious/noArrayIndexKey: a fixed-length tier track, position is the identity.
								key={index}
								type="button"
								aria-pressed={marked}
								aria-label={
									marked
										? `Clear tier ${tierNumber} of ${named}`
										: `Apply tier ${tierNumber} of ${named}`
								}
								onClick={(event) => {
									stopForToggle?.(event);
									dispatch(
										marked
											? {
													type: "clearStatusTier",
													id: status.id,
													tier: tierNumber,
												}
											: {
													type: "markStatusTier",
													id: status.id,
													tier: tierNumber,
												},
									);
								}}
								className="flex h-9 w-9 items-center justify-center"
							>
								<span aria-hidden className={marked ? LIT : UNLIT} />
							</Button>
						);
					})}
				</fieldset>
			</div>

			<div className="flex shrink-0 items-center gap-1 self-center">
				<span className="font-display text-base font-semibold tracking-[0.04em] text-[var(--hue-text)]">
					{tier}
				</span>
				{onToggle ? (
					// biome-ignore lint/a11y/noStaticElementInteractions: swallows a click so it doesn't also toggle the card; the menu trigger inside keeps its own keyboard handling.
					// biome-ignore lint/a11y/useKeyWithClickEvents: same reason, no keyboard action of its own to add.
					<span onClick={stopForToggle}>{menu("")}</span>
				) : (
					menu("")
				)}
			</div>
		</>
	);

	const tone = selected
		? "border-[var(--hue)] bg-[var(--hue)]/16 shadow-[0_0_14px_color-mix(in_oklab,var(--hue)_22%,transparent)]"
		: "border-[var(--hue)]/30 bg-surface";

	return (
		<li
			data-valence={status.valence}
			className={
				onToggle
					? `flex items-stretch gap-2 rounded-[5px] border border-l-[3px] border-l-[var(--hue)] py-2 pr-2 pl-2.5 ${tone}`
					: "flex items-stretch gap-2 rounded-[5px] border border-[var(--hue)]/30 border-l-[3px] border-l-[var(--hue)] bg-surface py-2 pr-2 pl-2.5"
			}
		>
			{onToggle ? (
				<Toggle
					nativeButton={false}
					render={<div />}
					pressed={!!selected}
					onPressedChange={onToggle}
					className="flex min-w-0 flex-1 items-stretch gap-2"
				>
					{body}
				</Toggle>
			) : (
				body
			)}
			{limitDialog}
		</li>
	);
}
