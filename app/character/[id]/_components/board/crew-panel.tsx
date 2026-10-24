"use client";

import { useState } from "react";
import {
	EditLink,
	EMPTY_SHELL,
	SHELL,
	type TagChip,
	TagList,
} from "@/app/character/[id]/_components/board/panel-shell";
import {
	CardTracks,
	UpgradeDialog,
} from "@/app/character/[id]/_components/track";
import type { RollGroup } from "@/app/character/[id]/_lib/roll-selection";
import { CardLabel } from "@/components/card-label";
import { QuoteLine, SpecialsList } from "@/components/card-parts";
import { GroupLabel } from "@/components/group-label";
import { CREW_THEME_ID, MOTIVATION_TYPE } from "@/lib/character/crew-theme";
import { isNascent, themeTitle } from "@/lib/character/theme";
import type { CrewRelationship, CrewTheme } from "@/lib/character/types";

export function CrewPanel({
	crewTheme,
	relationships,
	group,
	tagChip,
	id,
}: {
	crewTheme: CrewTheme;
	relationships: CrewRelationship[];
	group: RollGroup;
	tagChip: TagChip;
	id: string;
}) {
	const [upgradeOpen, setUpgradeOpen] = useState(false);
	const href = `/character/${id}/crew`;
	const empty = group.tags.length === 0;
	const relationshipIds = new Set(relationships.map((r) => r.id));
	const mainTags = group.tags.filter((tag) => !relationshipIds.has(tag.id));
	const relationshipTags = group.tags.filter((tag) =>
		relationshipIds.has(tag.id),
	);
	const mixed = mainTags.length > 0 && relationshipTags.length > 0;

	return (
		<section
			data-type={MOTIVATION_TYPE[crewTheme.motivation]}
			className={empty ? EMPTY_SHELL : SHELL}
		>
			<div className="flex items-center justify-between gap-2">
				<CardLabel>Crew</CardLabel>
				<EditLink
					href={href}
					label={`Edit ${themeTitle(crewTheme)?.text.trim() || "the crew theme"}`}
				/>
			</div>
			<div className="flex items-center gap-3.5">
				<CardTracks
					themeId={CREW_THEME_ID}
					card={crewTheme}
					size="sm"
					onUpgrade={() => setUpgradeOpen(true)}
				/>
			</div>

			{empty ? (
				<p className="font-sans text-sm text-dim">Nothing built yet.</p>
			) : (
				<>
					{mixed && <GroupLabel>Tags</GroupLabel>}
					{mainTags.length > 0 && (
						<TagList group={{ ...group, tags: mainTags }} tagChip={tagChip} />
					)}
					{relationshipTags.length > 0 && (
						<>
							{mixed && (
								<GroupLabel spaced>
									Relationships · {relationshipTags.length}
								</GroupLabel>
							)}
							<TagList
								group={{ ...group, tags: relationshipTags }}
								tagChip={tagChip}
							/>
						</>
					)}
				</>
			)}

			<QuoteLine label={crewTheme.motivation} quote={crewTheme.quote} />

			<SpecialsList specials={crewTheme.specials} />

			<UpgradeDialog
				themeId={CREW_THEME_ID}
				themeHref={href}
				nascent={isNascent(crewTheme)}
				open={upgradeOpen}
				onOpenChange={setUpgradeOpen}
			/>
		</section>
	);
}
