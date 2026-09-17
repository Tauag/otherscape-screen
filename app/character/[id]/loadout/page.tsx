"use client";

import { Button } from "@base-ui/react/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { ConfirmDialog } from "@/app/character/[id]/_components/confirm-dialog";
import { SpecialList } from "@/app/character/[id]/_components/special-card";
import { PRIMARY, SMALL_BUTTON } from "@/app/character/[id]/_components/styles";
import { TrackPips } from "@/app/character/[id]/_components/track";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { SetCard } from "@/app/character/[id]/loadout/_components/set-card";
import { BackLink } from "@/components/back-link";
import { LABEL } from "@/components/styles";
import type { UpgradeChoice } from "@/lib/loadout-edit";
import { UPGRADE_TRACK_LENGTH, WILDCARD_TAG_COST } from "@/lib/rules/constants";
import { loadoutSpend } from "@/lib/rules/loadout";

const ADD = `${SMALL_BUTTON} self-start text-dim`;
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
		const willComplete = loadout.upgrade + 1 >= UPGRADE_TRACK_LENGTH;
		dispatch({ type: "markLoadoutUpgrade" });
		if (willComplete) setOpen(true);
	}

	function take(choice: UpgradeChoice) {
		dispatch({ type: "takeLoadoutUpgrade", choice });
		setOpen(false);
		if (choice === "special") router.push(`/character/${id}/loadout/specials`);
	}

	return (
		<main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-5 pt-6 pb-8">
			<BackLink href={`/character/${id}`} text="Sheet" />

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
						onClick={() => dispatch({ type: "adjustLoadoutPower", delta: -1 })}
						disabled={spend.available === 0}
						className={STEP}
						aria-label="Remove one available Power"
					>
						−
					</Button>
					<Button
						type="button"
						onClick={() => dispatch({ type: "adjustLoadoutPower", delta: 1 })}
						className={STEP}
						aria-label="Add one available Power"
					>
						+
					</Button>
				</div>
				{spend.warning && (
					<p className="pt-1 font-sans text-sm text-negative-text">
						{spend.warning}
					</p>
				)}
			</section>

			<section className="flex flex-col gap-2 pb-2">
				<TrackPips
					name="Upgrade"
					short="UPG"
					length={UPGRADE_TRACK_LENGTH}
					marked={loadout.upgrade}
					size="lg"
					active
					onMark={mark}
				/>
			</section>

			<section className="flex flex-col gap-2 rounded-md border border-border bg-surface p-4">
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

			<section className="flex flex-col gap-2">
				<p className={LABEL}>Loadout Sets</p>
				{loadout.sets.length === 0 ? (
					<p className="font-sans text-sm text-dim">
						No loadout sets yet. A set holds a title tag, its feature tags, and
						any weakness tags.
					</p>
				) : (
					loadout.sets.map((set) => <SetCard key={set.id} set={set} />)
				)}

				<Button
					type="button"
					onClick={() =>
						dispatch({ type: "addLoadoutSet", id: crypto.randomUUID() })
					}
					className={`${SMALL_BUTTON} self-start text-dim`}
				>
					+ Loadout set
				</Button>
			</section>

			<section className="flex flex-col gap-1.5">
				<p className={LABEL}>Loadout specials</p>
				{loadout.specials.length === 0 ? (
					<p className="font-sans text-sm text-dim">No loadout specials yet.</p>
				) : (
					<SpecialList
						specials={loadout.specials}
						onRemove={(special) =>
							dispatch({ type: "removeLoadoutSpecial", special })
						}
					/>
				)}
				<Link
					href={`/character/${id}/loadout/specials`}
					className={`${ADD} mt-1`}
				>
					Choose loadout specials
				</Link>
			</section>

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
