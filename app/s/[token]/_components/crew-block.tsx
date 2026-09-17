import { Pips } from "@/app/s/[token]/_components/pips";
import {
	CARD,
	CARD_BODY,
	CARD_STRIPE,
} from "@/app/s/[token]/_components/styles";
import { Chip } from "@/components/chip";
import { crewTitle, isCrewNascent } from "@/lib/character/crew-theme";
import type { CrewRelationship, CrewTheme } from "@/lib/character/types";
import { specialName } from "@/lib/pickers";
import {
	DECAY_TRACK_LENGTH,
	UPGRADE_TRACK_LENGTH,
} from "@/lib/rules/constants";

export function CrewBlock({
	crew,
	relationships,
}: {
	crew: CrewTheme;
	relationships: CrewRelationship[];
}) {
	const title = crewTitle(crew);
	const nascent = isCrewNascent(crew);

	if (
		crew.powerTags.length === 0 &&
		crew.weaknessTags.length === 0 &&
		relationships.length === 0
	) {
		return null;
	}

	return (
		<article data-type="crew" className={CARD}>
			<div aria-hidden="true" className={CARD_STRIPE} />
			<div className={CARD_BODY}>
				<div className="flex items-center justify-between gap-2">
					<span className="font-display text-[10px] font-semibold tracking-[0.17em] text-dim uppercase">
						Crew · {crew.motivation}
					</span>
					<div className="flex items-center gap-3">
						{nascent && (
							<span className="border border-pip px-[5px] py-0.5 font-mono text-[8px] font-bold tracking-[0.1em] text-dim">
								NASCENT
							</span>
						)}
						<Pips
							name="UPG"
							marked={crew.upgrade}
							length={UPGRADE_TRACK_LENGTH}
						/>
						<Pips name="DEC" marked={crew.decay} length={DECAY_TRACK_LENGTH} />
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
					{crew.powerTags
						.filter((tag) => tag.id !== title?.id)
						.map((tag) => (
							<Chip
								key={tag.id}
								label={tag.letter}
								text={tag.text}
								burnt={tag.burnt}
							/>
						))}
					{crew.weaknessTags.map((tag) => (
						<Chip key={tag.id} label={tag.letter} text={tag.text} negative />
					))}
				</ul>

				{relationships.length > 0 && (
					<ul className="flex flex-col gap-1">
						{relationships.map((relationship) => (
							<li
								key={relationship.id}
								className="font-sans text-[13px] text-dim"
							>
								<span className="text-[var(--hue-text)]">
									{relationship.member.trim() || "Unnamed"}
								</span>
								{relationship.tag.trim() && ` — ${relationship.tag}`}
							</li>
						))}
					</ul>
				)}

				{crew.specials.length > 0 && (
					<ul className="flex flex-col gap-1">
						{crew.specials.map((special) => (
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
