import { Chip } from "@/components/chip";
import { Pips } from "@/components/pips";
import { CARD, CARD_BODY, CARD_STRIPE } from "@/components/styles";
import { decayFull } from "@/lib/character/loss";
import { isNascent, themeLine, themeTitle } from "@/lib/character/theme";
import type { Theme } from "@/lib/character/types";
import { specialName } from "@/lib/pickers";
import {
	DECAY_TRACK_LENGTH,
	UPGRADE_TRACK_LENGTH,
} from "@/lib/rules/constants";

export function ThemeBlock({ theme }: { theme: Theme }) {
	const title = themeTitle(theme);
	const nascent = isNascent(theme);

	return (
		<article data-type={theme.type} className={CARD}>
			<div aria-hidden="true" className={CARD_STRIPE} />
			<div className={CARD_BODY}>
				<div className="flex items-center justify-between gap-2">
					<span className="font-display text-[10px] font-semibold tracking-[0.17em] text-dim uppercase">
						{theme.type} · {theme.themebook.trim() || "No themebook"}
					</span>
					<div className="flex items-center gap-3">
						{nascent && (
							<span className="border border-pip px-[5px] py-0.5 font-mono text-[8px] font-bold tracking-[0.1em] text-dim">
								NASCENT
							</span>
						)}
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

				{theme.quote.trim() && (
					<div className="flex items-baseline gap-[7px] pt-0.5">
						<span className="shrink-0 font-mono text-[8px] font-bold tracking-[0.14em] text-faint uppercase">
							{themeLine(theme.type)}
						</span>
						<span className="font-sans text-[12.5px] text-quiet italic">
							{theme.quote}
						</span>
					</div>
				)}

				{theme.specials.length > 0 && (
					<ul className="flex flex-col gap-1">
						{theme.specials.map((special) => (
							<li key={special} className="flex items-baseline gap-[7px]">
								<span className="shrink-0 font-mono text-[8px] font-bold tracking-[0.14em] text-[var(--hue)]/80 uppercase">
									Special
								</span>
								<span className="font-sans text-[13px] text-[var(--hue-text)]">
									{specialName(special)}
								</span>
							</li>
						))}
					</ul>
				)}

				{decayFull(theme) && (
					<p className="font-sans text-sm text-negative-text">
						The Decay track is full.
					</p>
				)}
			</div>
		</article>
	);
}
