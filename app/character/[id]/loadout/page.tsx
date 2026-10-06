"use client";

import { Button } from "@base-ui/react/button";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import {
	EDITOR_ASIDE,
	EDITOR_GRID,
	EDITOR_HEADER,
	EDITOR_HEADING,
	EDITOR_PAGE,
	EDITOR_TITLE,
	EDITOR_TRACKS,
	PANEL,
	SaveLink,
} from "@/app/character/[id]/_components/editor";
import { SpecialList } from "@/app/character/[id]/_components/special-card";
import { PRIMARY, SMALL_BUTTON } from "@/app/character/[id]/_components/styles";
import {
	TrackPips,
	UpgradeSquareButton,
} from "@/app/character/[id]/_components/track";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { SetCard } from "@/app/character/[id]/loadout/_components/set-card";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { LabelAction } from "@/components/label-action";
import { LABEL } from "@/components/styles";
import type { UpgradeChoice } from "@/lib/loadout-edit";
import { UPGRADE_TRACK_LENGTH, WILDCARD_TAG_COST } from "@/lib/rules/constants";
import { loadoutSpend } from "@/lib/rules/loadout";
import { PlusIcon } from "../_components/icons";

const STEP =
	"grid size-11 place-items-center rounded-sm border border-border text-dim disabled:opacity-40";

export default function LoadoutPage({
	params,
}: PageProps<"/character/[id]/loadout">) {
	const { id } = use(params);
	const { character, dispatch } = useCharacter();
	const { loadout } = character;
	const spend = loadoutSpend(loadout);
	const router = useRouter();

	const [open, setOpen] = useState(false);

	function mark() {
		dispatch({ type: "markLoadoutUpgrade" });
	}

	function take(choice: UpgradeChoice) {
		dispatch({ type: "takeLoadoutUpgrade", choice });
		setOpen(false);
		if (choice === "special") router.push(`/character/${id}/loadout/specials`);
	}

	return (
		<main data-type="loadout" className={EDITOR_PAGE}>
			<header className={EDITOR_HEADER}>
				<div className={EDITOR_HEADING}>
					<h1 className={EDITOR_TITLE}>Loadout</h1>
					<div className="flex flex-wrap items-start gap-x-10 gap-y-5">
						<section>
							<p className={LABEL}>Loadout Power</p>
							<div className="flex items-center gap-3 pt-1">
								<p className="font-mono text-sm text-dim">
									<span className="font-display text-2xl leading-none font-bold text-primary">
										{spend.spent}
									</span>{" "}
									/ {spend.available} Spent
								</p>
								<Button
									type="button"
									onClick={() =>
										dispatch({ type: "adjustLoadoutPower", delta: -1 })
									}
									disabled={spend.available === 0}
									className={STEP}
									aria-label="Remove one available Power"
								>
									−
								</Button>
								<Button
									type="button"
									onClick={() =>
										dispatch({ type: "adjustLoadoutPower", delta: 1 })
									}
									className={STEP}
									aria-label="Add one available Power"
								>
									+
								</Button>
								<Button
									type="button"
									onClick={() => dispatch({ type: "unloadAllLoadout" })}
									className={`${SMALL_BUTTON} self-end text-dim`}
								>
									Unload all
								</Button>
							</div>
							{spend.warning && (
								<p className="pt-1 mt-4 font-sans text-sm text-negative-text">
									{spend.warning}
								</p>
							)}
						</section>

						<section>
							<p className={LABEL}>Wildcards</p>
							<div className="flex items-center gap-3 pt-1">
								<Button
									type="button"
									onClick={() => dispatch({ type: "decrementWildcards" })}
									disabled={loadout.wildcards === 0}
									className={STEP}
									aria-label="Remove a wildcard"
								>
									−
								</Button>
								<span className="min-w-6 text-center font-display text-2xl leading-none font-bold text-primary">
									{loadout.wildcards}
								</span>
								<Button
									type="button"
									onClick={() => dispatch({ type: "incrementWildcards" })}
									className={STEP}
									aria-label="Add a wildcard"
								>
									+
								</Button>
								<span className="font-mono text-xs text-dim">
									{WILDCARD_TAG_COST}P each
								</span>
							</div>
						</section>
					</div>
				</div>

				<section className={EDITOR_TRACKS}>
					<TrackPips
						name="Upgrade"
						short="UPG"
						length={UPGRADE_TRACK_LENGTH}
						marked={loadout.upgrade}
						size="lg"
						active
						onMark={mark}
					/>
					<UpgradeSquareButton
						pending={loadout.pendingUpgrades}
						onOpen={() => setOpen(true)}
					/>
				</section>
			</header>

			<div className={EDITOR_GRID}>
				<section className="flex flex-col gap-2 lg:gap-3">
					<LabelAction
						label="Loadout sets"
						onClick={() => {
							const setId = crypto.randomUUID();
							dispatch({ type: "addLoadoutSet", id: setId });
							router.push(`/character/${id}/loadout#loadout-set-${setId}`);
						}}
					>
						<PlusIcon /> loadout set
					</LabelAction>
					{loadout.sets.length === 0 ? (
						<p className="font-sans text-sm text-dim">
							No loadout sets yet. A set holds a title tag, its feature tags,
							and any weakness tags.
						</p>
					) : (
						loadout.sets.map((set) => <SetCard key={set.id} set={set} />)
					)}
				</section>

				<aside className={EDITOR_ASIDE}>
					<section className={PANEL}>
						<LabelAction
							label="Loadout specials"
							href={`/character/${id}/loadout/specials`}
						>
							<PlusIcon /> loadout special
						</LabelAction>
						{loadout.specials.length === 0 ? (
							<p className="font-sans text-sm text-dim">
								No loadout specials yet.
							</p>
						) : (
							<SpecialList
								specials={loadout.specials}
								onRemove={(special) =>
									dispatch({ type: "removeLoadoutSpecial", special })
								}
							/>
						)}
					</section>

					<SaveLink href={`/character/${id}`} />
				</aside>
			</div>

			<ConfirmDialog
				open={open}
				onOpenChange={setOpen}
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
		</main>
	);
}
