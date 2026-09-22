"use client";

import Link from "next/link";
import { useState } from "react";
import {
	EditLink,
	EMPTY_SHELL,
	HEADER_LABEL,
	NASCENT_BADGE,
	PanelQuote,
	SHELL,
	type TagChip,
	TagList,
} from "@/app/character/[id]/_components/board/panel-shell";
import { Track, UpgradeDialog } from "@/app/character/[id]/_components/track";
import type { RollGroup } from "@/app/character/[id]/_lib/roll-selection";
import { isNascent, themeLine, themeTitle } from "@/lib/character/theme";
import type { Theme } from "@/lib/character/types";

export function ThemePanel({
	theme,
	group,
	tagChip,
	id,
}: {
	theme: Theme;
	group: RollGroup;
	tagChip: TagChip;
	id: string;
}) {
	const [upgradeOpen, setUpgradeOpen] = useState(false);
	const href = `/character/${id}/theme/${theme.id}`;
	const empty = group.tags.length === 0;
	const title = themeTitle(theme);

	if (empty) {
		return (
			<section data-type={theme.type} className={EMPTY_SHELL}>
				<div className="flex items-center justify-between gap-2">
					<span className={`${HEADER_LABEL} text-muted`}>{group.label}</span>
					<span className={NASCENT_BADGE}>NASCENT</span>
				</div>
				<Link
					href={href}
					className="mt-1 flex min-h-11 items-center justify-center rounded-sm border border-dashed border-pip font-display text-xs font-semibold tracking-[0.08em] text-dim uppercase"
				>
					Build this theme
				</Link>
			</section>
		);
	}

	return (
		<section data-type={theme.type} className={SHELL}>
			<div className="flex items-center justify-between gap-2">
				<span className={HEADER_LABEL}>{group.label}</span>
				<EditLink
					href={href}
					label={`Edit ${title?.text.trim() || "this theme"}`}
				/>
			</div>

			<div className="flex items-center gap-3.5">
				<Track
					themeId={theme.id}
					track="upgrade"
					marked={theme.upgrade}
					size="sm"
					onComplete={() => setUpgradeOpen(true)}
				/>
				<Track
					themeId={theme.id}
					track="decay"
					marked={theme.decay}
					size="sm"
				/>
			</div>

			<TagList group={group} tagChip={tagChip} />

			<PanelQuote label={themeLine(theme.type)} quote={theme.quote} />

			<UpgradeDialog
				themeId={theme.id}
				themeHref={href}
				nascent={isNascent(theme)}
				open={upgradeOpen}
				onOpenChange={setUpgradeOpen}
			/>
		</section>
	);
}
