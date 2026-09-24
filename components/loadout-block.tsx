import { Chip } from "@/components/chip";
import { Pips } from "@/components/pips";
import { CARD, CARD_BODY, CARD_STRIPE } from "@/components/styles";
import type { Loadout } from "@/lib/character/types";
import { specialName } from "@/lib/pickers";
import { UPGRADE_TRACK_LENGTH } from "@/lib/rules/constants";
import { loadoutSpend } from "@/lib/rules/loadout";

export function LoadoutBlock({ loadout }: { loadout: Loadout }) {
	const spend = loadoutSpend(loadout);
	const loadedSets = loadout.sets.filter((set) => set.titleLoaded);

	if (
		loadedSets.length === 0 &&
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

				{loadedSets.map((set) => {
					const features = set.features.filter((feature) => feature.loaded);
					return (
						<div
							key={set.id}
							className="flex flex-col gap-1.5 border-l-2 border-[var(--hue)]/40 pl-2.5"
						>
							<h3
								className={`font-display text-[17px] leading-tight font-bold tracking-[0.045em] uppercase ${
									set.titleBurnt
										? "text-muted line-through"
										: "text-[var(--hue-title)]"
								}`}
							>
								{set.title.trim() || "Untitled set"}
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

				{loadout.wildcards > 0 && (
					<p className="self-start border border-dashed border-pip px-[5px] py-0.5 font-mono text-[8px] font-bold tracking-[0.1em] text-dim">
						WILDCARD{loadout.wildcards > 1 && ` ×${loadout.wildcards}`}
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
		</article>
	);
}
