import {
	NascentBadge,
	QuoteLine,
	SpecialsList,
	TagChips,
} from "@/components/card-parts";
import { Pips } from "@/components/pips";
import { CARD, CARD_BODY, CARD_STRIPE } from "@/components/styles";
import { decayFull } from "@/lib/character/loss";
import { isNascent, themeLine, themeTitle } from "@/lib/character/theme";
import type { Theme } from "@/lib/character/types";
import {
	DECAY_TRACK_LENGTH,
	UPGRADE_TRACK_LENGTH,
} from "@/lib/rules/constants";

export function ThemeBlock({ theme }: { theme: Theme }) {
	const title = themeTitle(theme);

	return (
		<article data-type={theme.type} className={CARD}>
			<div aria-hidden="true" className={CARD_STRIPE} />
			<div className={CARD_BODY}>
				<div className="flex items-center justify-between gap-2">
					<span className="font-display text-[10px] font-semibold tracking-[0.17em] text-dim uppercase">
						{theme.type} · {theme.themebook.trim() || "No themebook"}
					</span>
					<div className="flex items-center gap-3">
						{isNascent(theme) && <NascentBadge />}
						<Pips
							name="UPG"
							marked={theme.upgrade}
							length={UPGRADE_TRACK_LENGTH}
						/>
						<Pips name="DEC" marked={theme.decay} length={DECAY_TRACK_LENGTH} />
					</div>
				</div>

				<h2
					className={`font-display text-[21px] leading-tight font-bold tracking-[0.045em] uppercase ${
						title?.burnt ? "text-muted line-through" : "text-[var(--hue-title)]"
					}`}
				>
					{title?.text.trim() || "No title tag yet."}
				</h2>

				<TagChips theme={theme} />
				<QuoteLine label={themeLine(theme.type)} quote={theme.quote} />
				<SpecialsList specials={theme.specials} />

				{decayFull(theme) && (
					<p className="font-sans text-sm text-negative-text">
						The Decay track is full.
					</p>
				)}
			</div>
		</article>
	);
}
