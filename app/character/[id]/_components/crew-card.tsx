"use client";

import { Button } from "@base-ui/react/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/app/character/[id]/_components/confirm-dialog";
import { FILLED } from "@/app/character/[id]/_components/styles";
import { TrackPips } from "@/app/character/[id]/_components/track";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { Chip } from "@/components/chip";
import { crewTitle, isCrewNascent } from "@/lib/character/crew-theme";
import { decayFull } from "@/lib/character/loss";
import type { CrewRelationship, CrewTheme } from "@/lib/character/types";
import { specialName } from "@/lib/pickers";
import {
	DECAY_TRACK_LENGTH,
	UPGRADE_TRACK_LENGTH,
} from "@/lib/rules/constants";

/** The sheet's summary of the crew theme, mirroring ThemeCard: a read-only
 *  card that links to the full crew screen. No self/mythos/noise type and no
 *  themebook - a crew is not built from one. */
export function CrewCard({
	crew,
	relationships,
	href,
}: {
	crew: CrewTheme;
	relationships: CrewRelationship[];
	href: string;
}) {
	const { dispatch } = useCharacter();
	const router = useRouter();
	const title = crewTitle(crew);
	const nascent = isCrewNascent(crew);
	const [upgradeOpen, setUpgradeOpen] = useState(false);

	function mark(event: React.MouseEvent<HTMLButtonElement>) {
		// The card is a single Link to the crew screen; preventDefault stops that
		// navigation so a track click only marks the box.
		event.preventDefault();
		const willComplete = crew.upgrade + 1 >= UPGRADE_TRACK_LENGTH;
		dispatch({ type: "markCrewTrack", track: "upgrade" });
		if (willComplete) setUpgradeOpen(true);
	}

	function markDecay(event: React.MouseEvent<HTMLButtonElement>) {
		event.preventDefault();
		dispatch({ type: "markCrewTrack", track: "decay" });
	}

	function takeTag() {
		const id = crypto.randomUUID();
		dispatch({ type: "addCrewPowerTag", id, letter: "A" });
		setUpgradeOpen(false);
		router.push(`${href}#tag-${id}`);
	}

	function takeSpecial() {
		setUpgradeOpen(false);
		router.push(`${href}/specials`);
	}

	return (
		<>
			<Link
				href={href}
				data-type="crew"
				className={`flex overflow-hidden rounded-md border transition-colors ${
					nascent
						? "border-dashed border-raised bg-recess hover:border-[var(--hue)]/60"
						: "border-border bg-surface hover:border-[var(--hue)]"
				}`}
			>
				<div
					aria-hidden="true"
					className={`w-[3px] shrink-0 ${nascent ? "bg-[var(--hue)]/35" : "bg-[var(--hue)]"}`}
				/>

				<div className="flex min-w-0 flex-1 flex-col gap-[9px] px-3 pt-[11px] pb-2.5">
					<div className="flex items-center justify-between gap-2">
						<span
							className={`font-display text-[10px] font-semibold tracking-[0.17em] uppercase ${
								nascent ? "text-muted" : "text-dim"
							}`}
						>
							Crew · {crew.motivation}
						</span>

						<div className="flex items-center gap-3">
							{nascent && (
								<span className="border border-pip px-[5px] py-0.5 font-mono text-[8px] font-bold tracking-[0.1em] text-dim">
									NASCENT
								</span>
							)}
							<div className="flex items-center gap-4">
								<TrackPips
									name="Upgrade"
									short="UPG"
									length={UPGRADE_TRACK_LENGTH}
									marked={crew.upgrade}
									size="sm"
									active
									onMark={mark}
								/>
								<TrackPips
									name="Decay"
									short="DEC"
									length={DECAY_TRACK_LENGTH}
									marked={crew.decay}
									size="sm"
									active={false}
									onMark={markDecay}
								/>
							</div>
						</div>
					</div>

					{title ? (
						<h2
							data-burnt={title.burnt ? "true" : undefined}
							className={`font-display text-[21px] leading-tight font-bold tracking-[0.045em] uppercase ${
								title.burnt ? "line-through" : ""
							} ${
								nascent
									? "text-[var(--hue-title)]/60"
									: "text-[var(--hue-title)] [text-shadow:0_0_20px_color-mix(in_oklab,var(--hue)_38%,transparent)]"
							}`}
						>
							{title.text}
						</h2>
					) : (
						<h2 className="min-h-11 content-center font-sans text-sm text-dim">
							No title tag yet.
						</h2>
					)}

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

					{crew.quote.trim() && (
						<div className="flex items-baseline gap-[7px] pt-0.5">
							<span className="shrink-0 font-mono text-[8px] font-bold tracking-[0.14em] text-faint uppercase">
								{crew.motivation}
							</span>
							<span className="font-sans text-[12.5px] text-quiet italic">
								{crew.quote}
							</span>
						</div>
					)}

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

					{crew.specials.length > 0 && (
						<ul className="flex flex-col gap-1">
							{crew.specials.map((special) => (
								<li key={special} className="font-sans text-[13px] text-dim">
									{specialName(special)}
								</li>
							))}
						</ul>
					)}

					{decayFull(crew) && (
						<p className="font-sans text-sm text-negative-text">
							The Decay track is full. Together, decide what this means for the
							crew.
						</p>
					)}
				</div>
			</Link>

			<ConfirmDialog
				open={upgradeOpen}
				onOpenChange={setUpgradeOpen}
				title="Take an Upgrade"
				description={
					nascent
						? "Three points, one Upgrade. A nascent crew theme takes a new power tag until it has all three."
						: "Three points, one Upgrade. Take a new power tag, which may answer any question, or a crew theme special."
				}
			>
				<Button type="button" onClick={takeTag} className={FILLED}>
					+ power tag
				</Button>
				{!nascent && (
					<Button type="button" onClick={takeSpecial} className={FILLED}>
						+ crew theme special
					</Button>
				)}
			</ConfirmDialog>
		</>
	);
}
