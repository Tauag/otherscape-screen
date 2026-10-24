import { Fragment } from "react";
import { Chip } from "@/components/chip";
import { ChipBadge } from "@/components/chip-badge";
import { GroupLabel } from "@/components/group-label";
import { SpecialTooltip } from "@/components/special-tooltip";
import { type ThemeCard, themeTitle } from "@/lib/character/theme";
import type {
	CrewRelationship,
	Loadout,
	LoadoutSet,
} from "@/lib/character/types";
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

/** Whether `TagChips` has anything to show: it leaves the title out. */
export function hasChipTags(theme: ThemeCard) {
	const title = themeTitle(theme);
	return (
		theme.powerTags.some((tag) => tag.id !== title?.id) ||
		theme.weaknessTags.length > 0
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

/** A crew's tags, then its relationships. The two groups get labels only when
 *  both have something to show. */
export function CrewTags({
	crew,
	relationships,
}: {
	crew: ThemeCard;
	relationships: CrewRelationship[];
}) {
	const hasTags = hasChipTags(crew);

	return (
		<>
			{hasTags && relationships.length > 0 && <GroupLabel>Tags</GroupLabel>}
			<TagChips theme={crew} />
			<RelationshipList relationships={relationships} labelled={hasTags} />
		</>
	);
}

/** The crew's relationship tags, under a label when `labelled` (the crew also has other tags). */
export function RelationshipList({
	relationships,
	labelled,
}: {
	relationships: CrewRelationship[];
	labelled: boolean;
}) {
	if (relationships.length === 0) return null;

	return (
		<>
			{labelled && (
				<GroupLabel>Relationships · {relationships.length}</GroupLabel>
			)}
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
		</>
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

/** The left bar that sets one loadout set apart: solid in the card's hue, or
 *  dashed when the set is stowed. */
export function SetBar({
	stowed = false,
	children,
}: {
	stowed?: boolean;
	children: React.ReactNode;
}) {
	return (
		<div
			className={`flex flex-col border-l-2 pl-2.5 ${
				stowed ? "border-dashed border-pip" : "border-[var(--hue)]/40"
			}`}
		>
			{children}
		</div>
	);
}

/** One loadout set: its heading and tags. A stowed set with tags folds under
 *  its heading. `showUnloaded` also lists a loaded set's unloaded features. */
export function LoadoutSetBlock({
	set,
	showUnloaded = false,
}: {
	set: LoadoutSet;
	showUnloaded?: boolean;
}) {
	const title = set.title.trim();
	const features = set.titleLoaded
		? set.features.filter((feature) => showUnloaded || feature.loaded)
		: set.features;
	const hasTags = features.length > 0 || set.weaknesses.length > 0;
	const tags = (
		<ul className="flex flex-wrap gap-1.5 pt-1.5">
			{features.map((feature) => (
				<Chip
					key={feature.id}
					label="+"
					text={feature.text}
					burnt={feature.burnt}
					stowed={!set.titleLoaded || !feature.loaded}
				/>
			))}
			{set.weaknesses.map((weakness) => (
				<Chip
					key={weakness.id}
					label="!"
					text={weakness.text}
					negative
					stowed={!set.titleLoaded}
				/>
			))}
		</ul>
	);
	const heading = (
		<h3
			className={`inline-flex items-center gap-1.5 font-display text-[17px] leading-tight font-bold tracking-[0.045em] uppercase ${
				set.titleBurnt
					? "text-muted line-through"
					: !set.titleLoaded
						? "text-muted"
						: title
							? "text-[var(--hue-title)]"
							: "text-dim"
			}`}
		>
			{title || "Untitled set"}
			{set.titleBurnt && <ChipBadge>BURNT</ChipBadge>}
			{!set.titleLoaded && <ChipBadge>STOWED</ChipBadge>}
		</h3>
	);

	return (
		<SetBar stowed={!set.titleLoaded}>
			{set.titleLoaded || !hasTags ? (
				<>
					{heading}
					{hasTags && tags}
				</>
			) : (
				<details>
					<summary className="cursor-pointer">{heading}</summary>
					{tags}
				</details>
			)}
		</SetBar>
	);
}

/** The loaded sets, the wildcard count, and the loadout specials. Stowed
 *  sets stay off unless `showStowed` is set. `showUnloaded` also lists a
 *  loaded set's unloaded features, as on the read-only share view, where
 *  they show dimmed and marked. */
export function LoadoutSummary({
	loadout,
	showStowed = false,
	showUnloaded = false,
}: {
	loadout: Loadout;
	showStowed?: boolean;
	showUnloaded?: boolean;
}) {
	// Stable sort: loaded sets first, each group keeps its default order.
	const visibleSets = loadout.sets
		.filter((set) => set.titleLoaded || showStowed)
		.sort((a, b) => Number(b.titleLoaded) - Number(a.titleLoaded));
	const loadedCount = visibleSets.filter((set) => set.titleLoaded).length;
	const stowedCount = visibleSets.length - loadedCount;
	// Group labels only help when both groups are on screen.
	const mixed = loadedCount > 0 && stowedCount > 0;

	return (
		<>
			{visibleSets.length > 0 && (
				<div className="flex flex-col gap-3">
					{visibleSets.map((set, index) => {
						const first =
							index === 0 ||
							visibleSets[index - 1].titleLoaded !== set.titleLoaded;

						return (
							<Fragment key={set.id}>
								{first && mixed && (
									<GroupLabel spaced={index > 0}>
										{set.titleLoaded ? "Loaded Sets" : "Stowed"} ·{" "}
										{set.titleLoaded ? loadedCount : stowedCount}
									</GroupLabel>
								)}
								<LoadoutSetBlock set={set} showUnloaded={showUnloaded} />
							</Fragment>
						);
					})}
				</div>
			)}

			{loadout.wildcards > 0 && (
				<p className="self-start border border-dashed border-pip px-[5px] py-0.5 font-mono text-[8px] font-bold tracking-[0.1em] text-dim">
					WILDCARD{loadout.wildcards > 1 && ` ×${loadout.wildcards}`}
				</p>
			)}

			<SpecialsList specials={loadout.specials} />
		</>
	);
}
