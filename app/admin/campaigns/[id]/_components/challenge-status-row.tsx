"use client";

import { Input } from "@base-ui/react/input";
import { Menu } from "@base-ui/react/menu";
import { RowMenu } from "@/components/row-menu";
import { MENU_ITEM } from "@/components/styles";
import { TierTrack } from "@/components/tier-track";
import type { Status } from "@/lib/character/types";
import { useCampaign } from "../_hooks/use-campaign";

const NAME =
	"min-w-[7ch] max-w-full bg-transparent font-display text-base font-semibold tracking-[0.04em] text-[var(--hue-text)] placeholder:text-dim field-sizing-content";

/**
 * One challenge's status: components/status-card.tsx's play-board sibling, minus
 * what that one supports and this one doesn't - toggling for roll selection,
 * and the tier-limit dialog (out of scope for T66).
 */
export function ChallengeStatusRow({
	challengeId,
	status,
	autoFocus,
}: {
	challengeId: string;
	status: Status;
	autoFocus: boolean;
}) {
	const { dispatch } = useCampaign();
	const tier = status.tiers.lastIndexOf(true) + 1;
	const named = status.name.trim() || "this status";

	return (
		<li
			data-valence={status.valence}
			className="notched flex items-stretch gap-2 border border-[var(--hue)]/30 [--bl:3px] border-l-[3px] border-l-[var(--hue)] bg-surface py-2 pr-2 pl-2.5"
		>
			<div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
				<Input
					type="text"
					autoComplete="off"
					value={status.name}
					autoFocus={autoFocus}
					onChange={(event) =>
						dispatch({
							type: "renameChallengeStatus",
							challengeId,
							id: status.id,
							name: event.target.value,
						})
					}
					aria-label="Status name"
					placeholder="Name this status"
					className={NAME}
				/>

				<TierTrack
					status={status}
					label={(tier, marked) =>
						marked ? `Tier ${tier}, marked` : `Tier ${tier}`
					}
					onTier={(tier, marked) =>
						dispatch({
							type: marked
								? "clearChallengeStatusTier"
								: "markChallengeStatusTier",
							challengeId,
							id: status.id,
							tier,
						})
					}
				/>
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
								type: "setChallengeStatusValence",
								challengeId,
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
							dispatch({
								type: "removeChallengeStatus",
								challengeId,
								id: status.id,
							})
						}
					>
						Delete
					</Menu.Item>
				</RowMenu>
			</div>
		</li>
	);
}
