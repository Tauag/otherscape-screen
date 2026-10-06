"use client";

import { useRouter } from "next/navigation";
import { HUE_PANEL, PANEL } from "@/app/character/[id]/_components/editor";
import { PlusIcon } from "@/app/character/[id]/_components/icons";
import { SpecialList } from "@/app/character/[id]/_components/special-card";
import { TagRow } from "@/app/character/[id]/_components/tag-row";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { LabelAction } from "@/components/label-action";
import { CREW_THEME_ID } from "@/lib/character/crew-theme";
import type { ThemeCard } from "@/lib/character/theme";
import { DEFAULT_BURN_VALUE } from "@/lib/rules/constants";

/**
 * The theme and crew editors' power and weakness tag panels. `themeId` is the
 * theme's id, or CREW_THEME_ID; only a theme's power tags can go broad.
 */
export function TagSections({
	themeId,
	card,
	here,
}: {
	themeId: string;
	card: ThemeCard;
	/** The editor's own route: tag links and the scroll-to anchor hang off it. */
	here: string;
}) {
	const { dispatch } = useCharacter();
	const router = useRouter();
	const crew = themeId === CREW_THEME_ID;

	return (
		<>
			<section className={HUE_PANEL}>
				<LabelAction
					label="Power tags"
					onClick={() => {
						const tagId = crypto.randomUUID();
						dispatch({ type: "addPowerTag", themeId, id: tagId, letter: "A" });
						router.push(`${here}#tag-${tagId}`);
					}}
				>
					<PlusIcon /> power tag
				</LabelAction>
				<ul className="@container flex flex-col gap-3">
					{card.powerTags.map((tag, index) => (
						<TagRow
							key={tag.id}
							kind="power"
							tag={tag}
							href={`${here}/tag/${tag.id}`}
							index={index}
							count={card.powerTags.length}
							onTextChange={(text) =>
								dispatch({
									type: "editPowerTag",
									themeId,
									tagId: tag.id,
									edit: { text },
								})
							}
							onMove={(direction) =>
								dispatch({
									type: "moveTag",
									themeId,
									kind: "power",
									tagId: tag.id,
									direction,
								})
							}
							onDelete={() =>
								dispatch({ type: "deletePowerTag", themeId, tagId: tag.id })
							}
							onBurntChange={(burnt) =>
								dispatch(
									burnt
										? {
												type: "burnTag",
												themeId,
												tagId: tag.id,
												burnValue: DEFAULT_BURN_VALUE,
											}
										: { type: "unburnTag", themeId, tagId: tag.id },
								)
							}
							onBroadChange={
								crew
									? undefined
									: () =>
											dispatch({
												type: "toggleBroadTag",
												themeId,
												tagId: tag.id,
											})
							}
						/>
					))}
				</ul>
			</section>

			<section data-valence="negative" className={HUE_PANEL}>
				<LabelAction
					label="Weakness tags"
					onClick={() => {
						const tagId = crypto.randomUUID();
						dispatch({
							type: "addWeaknessTag",
							themeId,
							id: tagId,
							letter: "A",
						});
						router.push(`${here}#tag-${tagId}`);
					}}
				>
					<PlusIcon /> weakness tag
				</LabelAction>
				<ul className="@container flex flex-col gap-3">
					{card.weaknessTags.map((tag, index) => (
						<TagRow
							key={tag.id}
							kind="weakness"
							tag={tag}
							href={`${here}/tag/${tag.id}`}
							index={index}
							count={card.weaknessTags.length}
							onTextChange={(text) =>
								dispatch({
									type: "editWeaknessTag",
									themeId,
									tagId: tag.id,
									edit: { text },
								})
							}
							onMove={(direction) =>
								dispatch({
									type: "moveTag",
									themeId,
									kind: "weakness",
									tagId: tag.id,
									direction,
								})
							}
							onDelete={() =>
								dispatch({ type: "deleteWeaknessTag", themeId, tagId: tag.id })
							}
						/>
					))}
				</ul>
			</section>
		</>
	);
}

/** The theme and crew editors' specials panel. */
export function ThemeSpecialsPanel({
	themeId,
	specials,
	here,
}: {
	themeId: string;
	specials: string[];
	here: string;
}) {
	const { dispatch } = useCharacter();
	const [label, noun] =
		themeId === CREW_THEME_ID
			? ["Crew theme specials", "crew theme special"]
			: ["Theme specials", "theme special"];

	return (
		<section className={PANEL}>
			<LabelAction label={label} href={`${here}/specials`}>
				<PlusIcon /> {noun}
			</LabelAction>
			{specials.length === 0 ? (
				<p className="font-sans text-sm text-dim">No {noun}s yet.</p>
			) : (
				<SpecialList
					specials={specials}
					onRemove={(special) =>
						dispatch({ type: "removeThemeSpecial", themeId, special })
					}
				/>
			)}
		</section>
	);
}
