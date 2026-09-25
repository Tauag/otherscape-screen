"use client";

import { Button } from "@base-ui/react/button";
import { Input } from "@base-ui/react/input";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { BurnButton } from "@/app/character/[id]/_components/burn-button";
import { SpecialList } from "@/app/character/[id]/_components/special-card";
import { FILLED } from "@/app/character/[id]/_components/styles";
import { TagRow } from "@/app/character/[id]/_components/tag-row";
import { TrackPips } from "@/app/character/[id]/_components/track";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { LabelAction } from "@/components/label-action";
import { LABEL } from "@/components/styles";
import { crewTitle, isCrewNascent } from "@/lib/character/crew-theme";
import { decayFull } from "@/lib/character/loss";
import type { CrewMotivation, ThemeType } from "@/lib/character/types";
import {
	DECAY_TRACK_LENGTH,
	DEFAULT_BURN_VALUE,
	UPGRADE_TRACK_LENGTH,
} from "@/lib/rules/constants";
import { PlusIcon } from "../_components/icons";

const FIELD =
	"min-h-11 rounded-sm border border-border bg-bg px-3 font-sans text-base";

const MOTIVATIONS: CrewMotivation[] = ["Identity", "Ritual", "Itch"];

/** Identity is the Self line, Ritual is Mythos, Itch is Noise, on every themebook. */
const MOTIVATION_TYPE: Record<CrewMotivation, ThemeType> = {
	Identity: "self",
	Ritual: "mythos",
	Itch: "noise",
};

export default function CrewPage({
	params,
}: PageProps<"/character/[id]/crew">) {
	const { id } = use(params);
	const { character, dispatch } = useCharacter();
	const router = useRouter();
	const crew = character.crewTheme;
	const title = crewTitle(crew);
	const nascent = isCrewNascent(crew);
	const [upgradeOpen, setUpgradeOpen] = useState(false);

	const here = `/character/${id}/crew`;

	function mark() {
		const willComplete = crew.upgrade + 1 >= UPGRADE_TRACK_LENGTH;
		dispatch({ type: "markCrewTrack", track: "upgrade" });
		if (willComplete) setUpgradeOpen(true);
	}

	function takeTag() {
		const tagId = crypto.randomUUID();
		dispatch({ type: "addCrewPowerTag", id: tagId, letter: "A" });
		setUpgradeOpen(false);
		router.push(`${here}#tag-${tagId}`);
	}

	function takeSpecial() {
		setUpgradeOpen(false);
		router.push(`${here}/specials`);
	}

	return (
		<main
			data-type="crew"
			className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-5 pt-3 pb-8"
		>
			<h1 className="font-display text-[26px] leading-tight font-bold tracking-[0.05em] text-[var(--hue-title)] uppercase">
				{title?.text.trim() || "Untitled crew"}
			</h1>

			<section className="flex gap-[10px]">
				<TrackPips
					name="Upgrade"
					short="UPG"
					length={UPGRADE_TRACK_LENGTH}
					marked={crew.upgrade}
					size="lg"
					active
					onMark={mark}
				/>
				<TrackPips
					name="Decay"
					short="DEC"
					length={DECAY_TRACK_LENGTH}
					marked={crew.decay}
					size="lg"
					active={false}
					onMark={() => dispatch({ type: "markCrewTrack", track: "decay" })}
				/>
			</section>

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

			<section className="flex flex-col gap-2">
				<LabelAction
					label="Power tags"
					onClick={() => {
						const tagId = crypto.randomUUID();
						dispatch({ type: "addCrewPowerTag", id: tagId, letter: "A" });
						router.push(`${here}#tag-${tagId}`);
					}}
				>
					<PlusIcon /> power tag
				</LabelAction>
				<ul className="flex flex-col gap-3">
					{crew.powerTags.map((tag, index) => (
						<TagRow
							key={tag.id}
							kind="power"
							tag={tag}
							href={`${here}/tag/${tag.id}`}
							index={index}
							count={crew.powerTags.length}
							onTextChange={(text) =>
								dispatch({
									type: "editCrewPowerTag",
									tagId: tag.id,
									edit: { text },
								})
							}
							onMove={(direction) =>
								dispatch({
									type: "moveCrewTag",
									kind: "power",
									tagId: tag.id,
									direction,
								})
							}
							onDelete={() =>
								dispatch({ type: "deleteCrewPowerTag", tagId: tag.id })
							}
							onBurntChange={(burnt) =>
								dispatch(
									burnt
										? {
												type: "burnCrewTag",
												tagId: tag.id,
												burnValue: DEFAULT_BURN_VALUE,
											}
										: { type: "unburnCrewTag", tagId: tag.id },
								)
							}
						/>
					))}
				</ul>

				<h2 className={LABEL}>Weakness tags</h2>
				<LabelAction
					label="Weakness tags"
					onClick={() => {
						const tagId = crypto.randomUUID();
						dispatch({ type: "addCrewWeaknessTag", id: tagId, letter: "A" });
						router.push(`${here}#tag-${tagId}`);
					}}
				>
					<PlusIcon /> weakness tag
				</LabelAction>
				<ul className="flex flex-col gap-3">
					{crew.weaknessTags.map((tag, index) => (
						<TagRow
							key={tag.id}
							kind="weakness"
							tag={tag}
							href={`${here}/tag/${tag.id}`}
							index={index}
							count={crew.weaknessTags.length}
							onTextChange={(text) =>
								dispatch({
									type: "editCrewWeaknessTag",
									tagId: tag.id,
									edit: { text },
								})
							}
							onMove={(direction) =>
								dispatch({
									type: "moveCrewTag",
									kind: "weakness",
									tagId: tag.id,
									direction,
								})
							}
							onDelete={() =>
								dispatch({ type: "deleteCrewWeaknessTag", tagId: tag.id })
							}
						/>
					))}
				</ul>
			</section>

			<fieldset className="flex flex-col gap-1.5">
				<legend className={LABEL}>Identity, Ritual, or Itch</legend>
				<div className="flex divide-x divide-border overflow-hidden rounded-sm border border-border">
					{MOTIVATIONS.map((motivation) => (
						<Button
							key={motivation}
							type="button"
							data-type={MOTIVATION_TYPE[motivation]}
							aria-pressed={crew.motivation === motivation}
							onClick={() =>
								dispatch({ type: "setCrewMotivation", motivation })
							}
							className={`flex-1 px-3 py-2 font-display text-sm font-semibold tracking-[0.08em] uppercase ${
								crew.motivation === motivation
									? "bg-[var(--hue)] text-bg"
									: "text-[var(--hue)]"
							}`}
						>
							{motivation}
						</Button>
					))}
				</div>
			</fieldset>

			<label htmlFor="crew-quote" className="flex flex-col gap-1">
				<span className={LABEL}>{crew.motivation}</span>
				<Input
					id="crew-quote"
					type="text"
					autoComplete="off"
					value={crew.quote}
					onChange={(event) =>
						dispatch({ type: "setCrewQuote", quote: event.target.value })
					}
					placeholder={`Create your ${crew.motivation}`}
					className={FIELD}
				/>
			</label>

			<section className="flex flex-col gap-1.5">
				<LabelAction
					label="Crew Relationships"
					onClick={() => {
						const relationshipId = crypto.randomUUID();
						dispatch({ type: "addCrewRelationship", id: relationshipId });
						router.push(`${here}#crew-relationship-${relationshipId}`);
					}}
				>
					<PlusIcon /> relationship tag
				</LabelAction>
				{character.crew.length === 0 ? (
					<p className="font-sans text-sm text-dim">
						No crew relationships yet.
					</p>
				) : (
					<ul className="flex flex-col gap-2">
						{character.crew.map((relationship) => {
							const named = relationship.member.trim() || "this crew member";
							return (
								<li
									key={relationship.id}
									id={`crew-relationship-${relationship.id}`}
									className="flex scroll-mt-20 divide-x divide-border overflow-hidden rounded-sm border border-border"
								>
									<Input
										type="text"
										autoComplete="off"
										value={relationship.member}
										onChange={(event) =>
											dispatch({
												type: "editCrewRelationship",
												id: relationship.id,
												edit: { member: event.target.value },
											})
										}
										aria-label="Crew member's name"
										placeholder="Name"
										className="min-h-11 w-2/5 bg-bg px-3 font-sans text-base"
									/>
									<Input
										type="text"
										autoComplete="off"
										value={relationship.tag}
										onChange={(event) =>
											dispatch({
												type: "editCrewRelationship",
												id: relationship.id,
												edit: { tag: event.target.value },
											})
										}
										aria-label={`Relationship tag with ${named}`}
										placeholder="Relationship tag"
										className={`min-h-11 flex-1 bg-bg px-3 font-sans text-base ${relationship.burnt ? "line-through" : ""}`}
									/>
									<BurnButton
										burnt={relationship.burnt}
										onBurntChange={(burnt) =>
											dispatch(
												burnt
													? {
															type: "burnCrewRelationship",
															id: relationship.id,
														}
													: {
															type: "unburnCrewRelationship",
															id: relationship.id,
														},
											)
										}
										named={`the relationship with ${named}`}
										square
									/>
									<Button
										type="button"
										onClick={() =>
											dispatch({
												type: "removeCrewRelationship",
												id: relationship.id,
											})
										}
										aria-label={`Remove ${named}`}
										className="grid size-11 shrink-0 place-items-center text-dim"
									>
										<span aria-hidden>✕</span>
									</Button>
								</li>
							);
						})}
					</ul>
				)}
			</section>

			<section className="flex flex-col gap-1.5">
				<LabelAction label="Crew theme specials" href={`${here}/specials`}>
					<PlusIcon /> crew theme special
				</LabelAction>
				{crew.specials.length === 0 ? (
					<p className="font-sans text-sm text-dim">
						No crew theme specials yet.
					</p>
				) : (
					<SpecialList
						specials={crew.specials}
						onRemove={(special) =>
							dispatch({ type: "removeCrewSpecial", special })
						}
					/>
				)}
			</section>

			{decayFull(crew) && (
				<p className="font-sans text-sm text-negative-text">
					The Decay track is full. Together, decide what this means for the
					crew.
				</p>
			)}
		</main>
	);
}
