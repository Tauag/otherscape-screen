"use client";

import { Button } from "@base-ui/react/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/app/character/[id]/_components/confirm-dialog";
import { EditIcon } from "@/app/character/[id]/_components/icons";
import { FILLED, PRIMARY } from "@/app/character/[id]/_components/styles";
import {
	Track,
	TrackPips,
	UpgradeDialog,
} from "@/app/character/[id]/_components/track";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import type {
	RollGroup,
	RollTag,
} from "@/app/character/[id]/_lib/roll-selection";
import { crewTitle, isCrewNascent } from "@/lib/character/crew-theme";
import { isNascent, themeLine, themeTitle } from "@/lib/character/theme";
import type { CrewTheme, Loadout, Theme } from "@/lib/character/types";
import type { UpgradeChoice } from "@/lib/loadout-edit";
import {
	DECAY_TRACK_LENGTH,
	UPGRADE_TRACK_LENGTH,
} from "@/lib/rules/constants";
import { loadoutSpend } from "@/lib/rules/loadout";

/** One group's header, pips, and tag rows: the board panel every theme,
 *  loadout, and crew slot renders itself as. Composition only, over the
 *  same leaf components the phone routes use (design.md 5, decision 4). */

export type TagChip = (tag: RollTag, hue?: string) => React.ReactNode;

const HEADER_LABEL =
	"font-display text-[10px] font-semibold tracking-[0.17em] text-dim uppercase";
const SHELL =
	"flex flex-col gap-2 overflow-y-auto rounded-md border border-border border-t-[3px] border-t-[var(--hue)] bg-surface px-3 pt-[11px] pb-3";
const EMPTY_SHELL =
	"flex flex-col gap-2 overflow-hidden rounded-md border border-dashed border-raised border-t-[3px] border-t-[var(--hue)]/35 bg-recess px-3 pt-[11px] pb-3";
const EDIT_LINK = "grid size-7 shrink-0 place-items-center text-faint";
const NASCENT_BADGE =
	"border border-pip px-[5px] py-0.5 font-mono text-[8px] font-bold tracking-[0.1em] text-dim";

function TagList({ group, tagChip }: { group: RollGroup; tagChip: TagChip }) {
	return (
		<ul className="flex flex-col gap-1.5">
			{group.tags.map((tag) => tagChip(tag, group.hue))}
		</ul>
	);
}

function EditLink({ href, label }: { href: string; label: string }) {
	return (
		<Link href={href} aria-label={label} className={EDIT_LINK}>
			<EditIcon />
		</Link>
	);
}

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

			{theme.quote.trim() && (
				<div className="flex items-baseline gap-[7px] pt-0.5">
					<span className="shrink-0 font-mono text-[8px] font-bold tracking-[0.14em] text-faint uppercase">
						{themeLine(theme.type)}
					</span>
					<span className="font-sans text-[12.5px] text-quiet italic">
						{theme.quote}
					</span>
				</div>
			)}

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

	function mark() {
		const willComplete = loadout.upgrade + 1 >= UPGRADE_TRACK_LENGTH;
		dispatch({ type: "markLoadoutUpgrade" });
		if (willComplete) setUpgradeOpen(true);
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
				<div className="flex items-center gap-3">
					<TrackPips
						name="Upgrade"
						short="UPG"
						length={UPGRADE_TRACK_LENGTH}
						marked={loadout.upgrade}
						size="sm"
						active
						onMark={mark}
					/>
					<EditLink href={href} label="Edit the loadout" />
				</div>
			</div>

			{empty ? (
				<p className="font-sans text-sm text-dim">Nothing loaded.</p>
			) : (
				<TagList group={group} tagChip={tagChip} />
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

export function CrewPanel({
	crewTheme,
	group,
	tagChip,
	id,
}: {
	crewTheme: CrewTheme;
	group: RollGroup;
	tagChip: TagChip;
	id: string;
}) {
	const { dispatch } = useCharacter();
	const router = useRouter();
	const [upgradeOpen, setUpgradeOpen] = useState(false);
	const href = `/character/${id}/crew`;
	const empty = group.tags.length === 0;
	const nascent = isCrewNascent(crewTheme);

	function markUpgrade() {
		const willComplete = crewTheme.upgrade + 1 >= UPGRADE_TRACK_LENGTH;
		dispatch({ type: "markCrewTrack", track: "upgrade" });
		if (willComplete) setUpgradeOpen(true);
	}

	function markDecay() {
		dispatch({ type: "markCrewTrack", track: "decay" });
	}

	function takeTag() {
		const tagId = crypto.randomUUID();
		dispatch({ type: "addCrewPowerTag", id: tagId, letter: "A" });
		setUpgradeOpen(false);
		router.push(`${href}#tag-${tagId}`);
	}

	function takeSpecial() {
		setUpgradeOpen(false);
		router.push(`${href}/specials`);
	}

	return (
		<section data-type="crew" className={empty ? EMPTY_SHELL : SHELL}>
			<div className="flex items-center justify-between gap-2">
				<span className={HEADER_LABEL}>Crew</span>
				<div className="flex items-center gap-3">
					<TrackPips
						name="Upgrade"
						short="UPG"
						length={UPGRADE_TRACK_LENGTH}
						marked={crewTheme.upgrade}
						size="sm"
						active
						onMark={markUpgrade}
					/>
					<TrackPips
						name="Decay"
						short="DEC"
						length={DECAY_TRACK_LENGTH}
						marked={crewTheme.decay}
						size="sm"
						active={false}
						onMark={markDecay}
					/>
					<EditLink
						href={href}
						label={`Edit ${crewTitle(crewTheme)?.text.trim() || "the crew theme"}`}
					/>
				</div>
			</div>

			{empty ? (
				<p className="font-sans text-sm text-dim">Nothing built yet.</p>
			) : (
				<TagList group={group} tagChip={tagChip} />
			)}

			{crewTheme.quote.trim() && (
				<div className="flex items-baseline gap-[7px] pt-0.5">
					<span className="shrink-0 font-mono text-[8px] font-bold tracking-[0.14em] text-faint uppercase">
						{crewTheme.motivation}
					</span>
					<span className="font-sans text-[12.5px] text-quiet italic">
						{crewTheme.quote}
					</span>
				</div>
			)}

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
		</section>
	);
}
