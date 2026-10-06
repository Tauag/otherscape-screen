"use client";

import { Button } from "@base-ui/react/button";
import { Input } from "@base-ui/react/input";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { BurnButton } from "@/app/character/[id]/_components/burn-button";
import {
	EDITOR_ASIDE,
	EDITOR_COLUMN,
	EDITOR_GRID,
	EDITOR_HEADER,
	EDITOR_PAGE,
	EDITOR_TITLE,
	EDITOR_TRACKS,
	FIELD,
	PANEL,
	SaveLink,
} from "@/app/character/[id]/_components/editor";
import { PlusIcon } from "@/app/character/[id]/_components/icons";
import {
	TagSections,
	ThemeSpecialsPanel,
} from "@/app/character/[id]/_components/tag-sections";
import {
	CardTracks,
	UpgradeDialog,
} from "@/app/character/[id]/_components/track";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { LabelAction } from "@/components/label-action";
import { LABEL } from "@/components/styles";
import { CREW_THEME_ID, MOTIVATION_TYPE } from "@/lib/character/crew-theme";
import { decayFull } from "@/lib/character/loss";
import { isNascent, themeTitle } from "@/lib/character/theme";
import type { CrewMotivation } from "@/lib/character/types";

const MOTIVATIONS: CrewMotivation[] = ["Identity", "Ritual", "Itch"];

export default function CrewPage({
	params,
}: PageProps<"/character/[id]/crew">) {
	const { id } = use(params);
	const { character, dispatch } = useCharacter();
	const router = useRouter();
	const crew = character.crewTheme;
	const title = themeTitle(crew);
	const [upgradeOpen, setUpgradeOpen] = useState(false);

	const here = `/character/${id}/crew`;

	return (
		<main data-type={MOTIVATION_TYPE[crew.motivation]} className={EDITOR_PAGE}>
			<header className={EDITOR_HEADER}>
				<h1 className={`${EDITOR_TITLE} lg:flex-1`}>
					{title?.text.trim() || "Untitled crew"}
				</h1>

				<section className={EDITOR_TRACKS}>
					<CardTracks
						themeId={CREW_THEME_ID}
						card={crew}
						size="lg"
						onUpgrade={() => setUpgradeOpen(true)}
					/>
				</section>
			</header>

			<UpgradeDialog
				themeId={CREW_THEME_ID}
				themeHref={here}
				nascent={isNascent(crew)}
				open={upgradeOpen}
				onOpenChange={setUpgradeOpen}
			/>

			<div className={EDITOR_GRID}>
				<div className={EDITOR_COLUMN}>
					<TagSections themeId={CREW_THEME_ID} card={crew} here={here} />

					<section className={PANEL}>
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
									const named =
										relationship.member.trim() || "this crew member";
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
				</div>

				<aside className={EDITOR_ASIDE}>
					<div className={`${PANEL} lg:gap-4`}>
						<fieldset className="flex flex-col gap-1.5">
							<legend className={LABEL}>Identity, Ritual, or Itch</legend>
							<div className="flex divide-x divide-border overflow-hidden rounded-sm border border-border mt-1">
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
									dispatch({
										type: "setThemeQuote",
										themeId: CREW_THEME_ID,
										quote: event.target.value,
									})
								}
								placeholder={`Create your ${crew.motivation}`}
								className={FIELD}
							/>
						</label>
					</div>

					<ThemeSpecialsPanel
						themeId={CREW_THEME_ID}
						specials={crew.specials}
						here={here}
					/>

					<SaveLink href={`/character/${id}`} />
					{decayFull(crew) && (
						<p className="font-sans text-sm text-negative-text">
							The Decay track is full. Together, decide what this means for the
							crew.
						</p>
					)}
				</aside>
			</div>
		</main>
	);
}
