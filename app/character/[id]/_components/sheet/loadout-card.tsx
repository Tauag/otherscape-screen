"use client";

import { useState } from "react";
import { SheetCard } from "@/app/character/[id]/_components/sheet/sheet-card";
import {
	LoadoutUpgradeDialog,
	TrackPips,
	UpgradeBadge,
} from "@/app/character/[id]/_components/track";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { CardLabel } from "@/components/card-label";
import { LoadoutSummary } from "@/components/card-parts";
import type { Loadout } from "@/lib/character/types";
import { UPGRADE_TRACK_LENGTH } from "@/lib/rules/constants";
import { loadoutSpend } from "@/lib/rules/loadout";

export function LoadoutCard({
	loadout,
	href,
}: {
	loadout: Loadout;
	href: string;
}) {
	const { dispatch } = useCharacter();
	const spend = loadoutSpend(loadout);
	const [upgradeOpen, setUpgradeOpen] = useState(false);

	const loaded = loadout.sets.filter((set) => set.titleLoaded).length;
	// Nothing to summarize: no loaded set and no wildcard reserved, so the card
	// reads like a nascent theme rather than an empty one.
	const empty = loaded === 0 && loadout.wildcards === 0;

	function mark(event: React.MouseEvent<HTMLButtonElement>) {
		// The card is a single Link to the loadout screen; preventDefault stops
		// that navigation so the click only marks the track.
		event.preventDefault();
		dispatch({ type: "markLoadoutUpgrade" });
	}

	return (
		<>
			<SheetCard
				href={href}
				type="loadout"
				faded={empty && loadout.sets.length === 0}
			>
				<div className="flex items-center justify-between gap-2">
					<CardLabel tone={spend.over > 0 ? "negative" : "dim"}>
						Loadout · {spend.spent} of {spend.available} Power
					</CardLabel>

					<div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1.5">
						<TrackPips
							name="Upgrade"
							short="UPG"
							length={UPGRADE_TRACK_LENGTH}
							marked={loadout.upgrade}
							size="sm"
							active
							onMark={mark}
						/>
						<UpgradeBadge
							pending={loadout.pendingUpgrades}
							onOpen={() => setUpgradeOpen(true)}
						/>
					</div>
				</div>

				{spend.warning && (
					<p className="font-sans text-sm text-negative-text">
						{spend.warning}
					</p>
				)}

				{empty && <p className="font-sans text-sm text-dim">Nothing loaded.</p>}
				{/* `contents` keeps the card's flex gap; the handler stops a stowed set's
				    toggle from also firing the card Link. It adds no interaction of
				    its own, so it needs no key handler. */}
				{/* biome-ignore lint/a11y/noStaticElementInteractions: click filter only */}
				{/* biome-ignore lint/a11y/useKeyWithClickEvents: click filter only */}
				<div
					className="contents"
					onClick={(event) => {
						if ((event.target as Element).closest("summary")) {
							event.stopPropagation();
						}
					}}
				>
					<LoadoutSummary loadout={loadout} showStowed />
				</div>
			</SheetCard>

			<LoadoutUpgradeDialog
				loadoutHref={href}
				open={upgradeOpen}
				onOpenChange={setUpgradeOpen}
			/>
		</>
	);
}
