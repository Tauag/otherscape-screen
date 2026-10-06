"use client";

import { Button } from "@base-ui/react/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
	EditLink,
	EMPTY_SHELL,
	HEADER_LABEL,
	SHELL,
	type TagChip,
	TagList,
} from "@/app/character/[id]/_components/board/panel-shell";
import { PRIMARY } from "@/app/character/[id]/_components/styles";
import {
	TrackPips,
	UpgradeBadge,
} from "@/app/character/[id]/_components/track";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import type { RollGroup } from "@/app/character/[id]/_lib/roll-selection";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { Loadout } from "@/lib/character/types";
import type { UpgradeChoice } from "@/lib/loadout-edit";
import { UPGRADE_TRACK_LENGTH } from "@/lib/rules/constants";
import { loadoutSpend } from "@/lib/rules/loadout";

export function LoadoutPanel({
	loadout,
	group,
	tagChip,
	id,
}: {
	loadout: Loadout;
	group: RollGroup;
	tagChip: TagChip;
	id: string;
}) {
	const { dispatch } = useCharacter();
	const router = useRouter();
	const [upgradeOpen, setUpgradeOpen] = useState(false);
	const href = `/character/${id}/loadout`;
	const spend = loadoutSpend(loadout);
	const empty = group.tags.length === 0;
	// A set's title tag opens its run of tags, so each set starts a new segment.
	const setIds = new Set(loadout.sets.map((set) => set.id));
	const segments = group.tags.reduce<RollGroup["tags"][]>((acc, tag) => {
		if (setIds.has(tag.id) || acc.length === 0) acc.push([]);
		acc[acc.length - 1].push(tag);
		return acc;
	}, []);

	function mark() {
		dispatch({ type: "markLoadoutUpgrade" });
	}

	function take(choice: UpgradeChoice) {
		dispatch({ type: "takeLoadoutUpgrade", choice });
		setUpgradeOpen(false);
		if (choice === "special") router.push(`${href}/specials`);
	}

	return (
		<section data-type="loadout" className={empty ? EMPTY_SHELL : SHELL}>
			<div className="flex items-center justify-between gap-2">
				<span
					className={`${HEADER_LABEL} ${spend.over > 0 ? "text-negative-text" : ""}`}
				>
					Loadout · {spend.spent} of {spend.available} Power
				</span>
				<EditLink href={href} label="Edit the loadout" />
			</div>
			<div className="flex items-center gap-3.5">
				<TrackPips
					name="Upgrade"
					short="UPG"
					length={UPGRADE_TRACK_LENGTH}
					marked={loadout.upgrade}
					size="sm"
					active
					onMark={mark}
				/>
				<UpgradeBadge
					pending={loadout.pendingUpgrades}
					onOpen={() => setUpgradeOpen(true)}
				/>
			</div>

			{empty ? (
				<p className="font-sans text-sm text-dim">Nothing loaded.</p>
			) : (
				<div className="flex flex-col divide-y divide-border *:py-2.5 *:first:pt-0 *:last:pb-0">
					{segments.map((tags) => (
						<TagList
							key={tags[0].id}
							group={{ ...group, tags }}
							tagChip={tagChip}
						/>
					))}
				</div>
			)}

			<ConfirmDialog
				open={upgradeOpen}
				onOpenChange={setUpgradeOpen}
				title="Take the loadout Upgrade"
				description="The track is full. Take one of the two. The track clears either way."
			>
				<Button type="button" onClick={() => take("power")} className={PRIMARY}>
					1 more available Power
				</Button>
				<Button
					type="button"
					onClick={() => take("special")}
					className={PRIMARY}
				>
					A loadout special
				</Button>
			</ConfirmDialog>
		</section>
	);
}
