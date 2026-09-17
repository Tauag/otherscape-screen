"use client";

import { Button } from "@base-ui/react/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Chip } from "@/app/character/[id]/_components/chip";
import { ConfirmDialog } from "@/app/character/[id]/_components/confirm-dialog";
import { LABEL, PRIMARY } from "@/app/character/[id]/_components/styles";
import { TrackPips } from "@/app/character/[id]/_components/track";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import type { Loadout } from "@/lib/character/types";
import type { UpgradeChoice } from "@/lib/loadout-edit";
import { specialName } from "@/lib/pickers";
import { UPGRADE_TRACK_LENGTH } from "@/lib/rules/constants";
import { loadoutSpend } from "@/lib/rules/loadout";

/** The sheet's summary of the loadout, mirroring ThemeCard: a read-only card
 *  that links to the full loadout screen. Only the Upgrade track is markable
 *  here, the same way a theme's tracks mark from its own card. */
export function LoadoutCard({
	loadout,
	href,
}: {
	loadout: Loadout;
	href: string;
}) {
	const { dispatch } = useCharacter();
	const router = useRouter();
	const spend = loadoutSpend(loadout);
	const [upgradeOpen, setUpgradeOpen] = useState(false);

	const loadedSets = loadout.sets.filter((set) => set.titleLoaded);
	const stowed = loadout.sets.length - loadedSets.length;
	// Nothing to summarize: no loaded set and no wildcard reserved, so the card
	// reads like a nascent theme rather than an empty one.
	const empty = loadedSets.length === 0 && loadout.wildcards === 0;

	function mark(event: React.MouseEvent<HTMLButtonElement>) {
		// The card is a single Link to the loadout screen; preventDefault stops
		// that navigation so the click only marks the track.
		event.preventDefault();
		const willComplete = loadout.upgrade + 1 >= UPGRADE_TRACK_LENGTH;
		dispatch({ type: "markLoadoutUpgrade" });
		if (willComplete) setUpgradeOpen(true);
	}

	function take(choice: UpgradeChoice) {
		dispatch({ type: "takeLoadoutUpgrade", choice });
		setUpgradeOpen(false);
		if (choice === "special") router.push(`${href}/specials`);
	}

	return (
		<>
			<Link
				href={href}
				data-type="loadout"
				className={`flex overflow-hidden rounded-md border transition-colors ${
					empty
						? "border-dashed border-raised bg-recess hover:border-[var(--hue)]/60"
						: "border-border bg-surface hover:border-[var(--hue)]"
				}`}
			>
				<div
					aria-hidden="true"
					className={`w-[3px] shrink-0 ${empty ? "bg-[var(--hue)]/35" : "bg-[var(--hue)]"}`}
				/>

				<div className="flex min-w-0 flex-1 flex-col gap-[9px] px-3 pt-[11px] pb-2.5">
					<div className="flex items-center justify-between gap-2">
						<span
							className={`font-display text-[10px] font-semibold tracking-[0.17em] uppercase ${
								spend.over > 0 ? "text-negative-text" : "text-dim"
							}`}
						>
							Loadout · {spend.spent} of {spend.available} Power
						</span>

						<TrackPips
							name="Upgrade"
							short="UPG"
							length={UPGRADE_TRACK_LENGTH}
							marked={loadout.upgrade}
							size="sm"
							active
							onMark={mark}
						/>
					</div>

					{spend.warning && (
						<p className="font-sans text-sm text-negative-text">
							{spend.warning}
						</p>
					)}

					{empty ? (
						<p className="font-sans text-sm text-dim">Nothing loaded.</p>
					) : (
						<>
							{loadedSets.length > 0 && (
								<div className="flex flex-col gap-3">
									{loadedSets.map((set, index) => {
										const title = set.title.trim();
										const features = set.features.filter(
											(feature) => feature.loaded,
										);
										return (
											<div
												key={set.id}
												className={`flex flex-col gap-1.5 border-l-2 border-[var(--hue)]/40 pl-2.5 ${
													index > 0 ? "border-t border-t-hairline pt-3" : ""
												}`}
											>
												<h3
													className={`flex items-center gap-1.5 font-display text-[17px] leading-tight font-bold tracking-[0.045em] uppercase ${
														set.titleBurnt
															? "text-muted line-through"
															: title
																? "text-[var(--hue-title)]"
																: "text-dim"
													}`}
												>
													{title || "Untitled set"}
													{set.titleBurnt && (
														<span className="bg-badge text-burnt px-1 py-0.5 font-mono text-[8px] font-normal tracking-[0.08em] no-underline">
															BURNT
														</span>
													)}
												</h3>
												{(features.length > 0 || set.weaknesses.length > 0) && (
													<ul className="flex flex-wrap gap-1.5">
														{features.map((feature) => (
															<Chip
																key={feature.id}
																label="+"
																text={feature.text}
																burnt={feature.burnt}
															/>
														))}
														{set.weaknesses.map((weakness) => (
															<Chip
																key={weakness.id}
																label="!"
																text={weakness.text}
																negative
															/>
														))}
													</ul>
												)}
											</div>
										);
									})}
								</div>
							)}

							{loadout.wildcards > 0 && (
								<p className="self-start border border-dashed border-pip px-[5px] py-0.5 font-mono text-[8px] font-bold tracking-[0.1em] text-dim">
									WILDCARD{loadout.wildcards > 1 && ` ×${loadout.wildcards}`}
								</p>
							)}
						</>
					)}

					{stowed > 0 && (
						<p className={LABEL}>
							{stowed} set{stowed === 1 ? "" : "s"} stowed
						</p>
					)}

					{loadout.specials.length > 0 && (
						<ul className="flex flex-col gap-1">
							{loadout.specials.map((special) => (
								<li key={special} className="font-sans text-[13px] text-dim">
									{specialName(special)}
								</li>
							))}
						</ul>
					)}
				</div>
			</Link>

			<ConfirmDialog
				open={upgradeOpen}
				onOpenChange={setUpgradeOpen}
				title="Take the loadout Upgrade"
				description="The track is full. Take one of the two. The track clears either way."
			>
				<Button type="button" onClick={() => take("power")} className={PRIMARY}>
					1 more available Power
				</Button>
				<Button
					type="button"
					onClick={() => take("special")}
					className={PRIMARY}
				>
					A loadout special
				</Button>
			</ConfirmDialog>
		</>
	);
}
