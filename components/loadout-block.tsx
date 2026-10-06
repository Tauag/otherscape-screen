import { LoadoutSummary } from "@/components/card-parts";
import { Pips } from "@/components/pips";
import { CARD, CARD_BODY, CARD_STRIPE } from "@/components/styles";
import type { Loadout } from "@/lib/character/types";
import { UPGRADE_TRACK_LENGTH } from "@/lib/rules/constants";
import { loadoutSpend } from "@/lib/rules/loadout";

export function LoadoutBlock({ loadout }: { loadout: Loadout }) {
	const spend = loadoutSpend(loadout);

	if (
		!loadout.sets.some((set) => set.titleLoaded) &&
		loadout.wildcards === 0 &&
		loadout.upgrade === 0 &&
		loadout.specials.length === 0
	) {
		return null;
	}

	return (
		<article data-type="loadout" className={CARD}>
			<div aria-hidden="true" className={CARD_STRIPE} />
			<div className={CARD_BODY}>
				<div className="flex items-center justify-between gap-2">
					<span
						className={`font-display text-[10px] font-semibold tracking-[0.17em] uppercase ${
							spend.over > 0 ? "text-negative-text" : "text-dim"
						}`}
					>
						Loadout · {spend.spent} of {spend.available} Power
					</span>
					<Pips
						name="UPG"
						marked={loadout.upgrade}
						length={UPGRADE_TRACK_LENGTH}
					/>
				</div>

				<LoadoutSummary loadout={loadout} />
			</div>
		</article>
	);
}
