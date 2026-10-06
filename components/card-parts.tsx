import { Chip } from "@/components/chip";
import { ChipBadge } from "@/components/chip-badge";
import { SpecialTooltip } from "@/components/special-tooltip";
import { type ThemeCard, themeTitle } from "@/lib/character/theme";
import type { Loadout } from "@/lib/character/types";
import { specialName, specialText } from "@/lib/pickers";

// The pieces a theme, crew, or loadout card is built from. The sheet's cards,
// the board's panels, and the read-only share view all draw through these.

export function NascentBadge() {
	return (
		<span className="border border-pip px-[5px] py-0.5 font-mono text-[8px] font-bold tracking-[0.1em] text-dim">
			NASCENT
		</span>
	);
}

/** Every tag but the title, which the card shows as its heading. */
export function TagChips({ theme }: { theme: ThemeCard }) {
	const title = themeTitle(theme);

	return (
		<ul className="flex flex-wrap gap-1.5">
			{theme.powerTags
				.filter((tag) => tag.id !== title?.id)
				.map((tag) => (
					<Chip
						key={tag.id}
						label={tag.letter}
						text={tag.text}
						burnt={tag.burnt}
						broad={tag.broad}
					/>
				))}
			{theme.weaknessTags.map((tag) => (
				<Chip key={tag.id} label={tag.letter} text={tag.text} negative />
			))}
		</ul>
	);
}

/** The Identity, Ritual, or Itch label set against the quote it belongs to. */
export function QuoteLine({ label, quote }: { label: string; quote: string }) {
	if (!quote.trim()) return null;

	return (
		<div className="flex items-baseline gap-[7px] pt-0.5">
			<span className="shrink-0 font-mono text-[8px] font-bold tracking-[0.14em] text-faint uppercase">
				{label}
			</span>
			<span className="font-sans text-[12.5px] text-quiet italic">{quote}</span>
		</div>
	);
}

export function SpecialsList({ specials }: { specials: string[] }) {
	if (specials.length === 0) return null;

	return (
		<ul className="flex flex-col gap-1">
			{specials.map((special) => (
				<li key={special} className="flex items-baseline gap-[7px]">
					<span className="shrink-0 font-mono text-[8px] font-bold tracking-[0.14em] text-[var(--hue)]/80 uppercase">
						Special
					</span>
					<SpecialTooltip text={specialText(special)}>
						<span className="font-sans text-[13px] text-[var(--hue-text)]">
							{specialName(special)}
						</span>
					</SpecialTooltip>
				</li>
			))}
		</ul>
	);
}

/** The loaded sets, the wildcard count, and the loadout specials. Stowed
 *  sets stay off: only what is loaded is usable in play. */
export function LoadoutSummary({ loadout }: { loadout: Loadout }) {
	const loadedSets = loadout.sets.filter((set) => set.titleLoaded);

	return (
		<>
			{loadedSets.length > 0 && (
				<div className="flex flex-col gap-3">
					{loadedSets.map((set) => {
						const title = set.title.trim();
						const features = set.features.filter((feature) => feature.loaded);
						return (
							<div
								key={set.id}
								className="flex flex-col gap-1.5 border-l-2 border-[var(--hue)]/40 pl-2.5"
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
									{set.titleBurnt && <ChipBadge>BURNT</ChipBadge>}
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

			{loadout.specials.length > 0 && (
				<ul className="flex flex-col gap-1">
					{loadout.specials.map((special) => (
						<li key={special} className="font-sans text-[13px] text-dim">
							<SpecialTooltip text={specialText(special)}>
								{specialName(special)}
							</SpecialTooltip>
						</li>
					))}
				</ul>
			)}
		</>
	);
}
