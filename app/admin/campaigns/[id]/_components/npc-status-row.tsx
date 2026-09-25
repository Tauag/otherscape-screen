"use client";

import { Button } from "@base-ui/react/button";
import { Input } from "@base-ui/react/input";
import { Menu } from "@base-ui/react/menu";
import { RowMenu } from "@/components/row-menu";
import { MENU_ITEM } from "@/components/styles";
import type { Status } from "@/lib/character/types";
import { useCampaign } from "../_hooks/use-campaign";

const NAME =
	"min-w-[7ch] max-w-full bg-transparent font-display text-base font-semibold tracking-[0.04em] text-[var(--hue-text)] placeholder:text-dim field-sizing-content";
const BOX = "h-3.5 w-9";
const LIT = `${BOX} bg-[var(--hue)] shadow-[0_0_8px_color-mix(in_oklab,var(--hue)_55%,transparent)]`;
const UNLIT = `${BOX} border border-[var(--hue)]/30`;

/**
 * One NPC's status: components/status-card.tsx's play-board sibling, minus
 * what that one supports and this one doesn't - toggling for roll selection,
 * and the tier-limit dialog (out of scope for T66).
 */
export function NpcStatusRow({
	npcId,
	status,
	autoFocus,
}: {
	npcId: string;
	status: Status;
	autoFocus: boolean;
}) {
	const { dispatch } = useCampaign();
	const tier = status.tiers.lastIndexOf(true) + 1;
	const named = status.name.trim() || "this status";

	return (
		<li
			data-valence={status.valence}
			className="flex items-stretch gap-2 rounded-[5px] border border-[var(--hue)]/30 border-l-[3px] border-l-[var(--hue)] bg-surface py-2 pr-2 pl-2.5"
		>
			<div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
				<Input
					type="text"
					autoComplete="off"
					value={status.name}
					autoFocus={autoFocus}
					onChange={(event) =>
						dispatch({
							type: "renameNpcStatus",
							npcId,
							id: status.id,
							name: event.target.value,
						})
					}
					aria-label="Status name"
					placeholder="Name this status"
					className={NAME}
				/>

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
									marked ? `Tier ${tierNumber}, marked` : `Tier ${tierNumber}`
								}
								onClick={() =>
									dispatch(
										marked
											? {
													type: "clearNpcStatusTier",
													npcId,
													id: status.id,
													tier: tierNumber,
												}
											: {
													type: "markNpcStatusTier",
													npcId,
													id: status.id,
													tier: tierNumber,
												},
									)
								}
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
				<RowMenu label={`Menu for ${named}`}>
					<Menu.Item
						className={MENU_ITEM}
						onClick={() =>
							dispatch({
								type: "setNpcStatusValence",
								npcId,
								id: status.id,
								valence:
									status.valence === "positive" ? "negative" : "positive",
							})
						}
					>
						{status.valence === "positive"
							? "Make it negative"
							: "Make it positive"}
					</Menu.Item>
					<Menu.Item
						className={MENU_ITEM}
						onClick={() =>
							dispatch({ type: "removeNpcStatus", npcId, id: status.id })
						}
					>
						Delete
					</Menu.Item>
				</RowMenu>
			</div>
		</li>
	);
}
