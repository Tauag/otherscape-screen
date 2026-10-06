import { NascentBadge, SpecialsList, TagChips } from "@/components/card-parts";
import { Pips } from "@/components/pips";
import { CARD, CARD_BODY, CARD_STRIPE } from "@/components/styles";
import { MOTIVATION_TYPE } from "@/lib/character/crew-theme";
import { isNascent, themeTitle } from "@/lib/character/theme";
import type { CrewRelationship, CrewTheme } from "@/lib/character/types";
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
	const title = themeTitle(crew);

	if (
		crew.powerTags.length === 0 &&
		crew.weaknessTags.length === 0 &&
		relationships.length === 0
	) {
		return null;
	}

	return (
		<article data-type={MOTIVATION_TYPE[crew.motivation]} className={CARD}>
			<div aria-hidden="true" className={CARD_STRIPE} />
			<div className={CARD_BODY}>
				<div className="flex items-center justify-between gap-2">
					<span className="font-display text-[10px] font-semibold tracking-[0.17em] text-dim uppercase">
						Crew · {crew.motivation}
					</span>
					<div className="flex items-center gap-3">
						{isNascent(crew) && <NascentBadge />}
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

				<TagChips theme={crew} />

				{relationships.length > 0 && (
					<ul className="flex flex-col gap-1">
						{relationships.map((relationship) => (
							<li
								key={relationship.id}
								className={`font-sans text-[13px] text-dim ${relationship.burnt ? "line-through" : ""}`}
							>
								<span className="text-[var(--hue-text)]">
									{relationship.member.trim() || "Unnamed"}
								</span>
								{relationship.tag.trim() && ` — ${relationship.tag}`}
							</li>
						))}
					</ul>
				)}

				<SpecialsList specials={crew.specials} />
			</div>
		</article>
	);
}
