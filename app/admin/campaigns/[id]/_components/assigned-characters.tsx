import { Menu } from "@base-ui/react/menu";
import Link from "next/link";
import { requireAdmin } from "@/app/admin/_lib/require-admin";
import { AssignDialog } from "@/app/admin/campaigns/[id]/_components/assign-dialog";
import { CharacterSheetDialog } from "@/app/admin/campaigns/[id]/_components/character-sheet-dialog";
import { DiscordRollsForm } from "@/app/admin/campaigns/[id]/_components/discord-rolls-form";
import { RemoveCharacterForm } from "@/app/admin/campaigns/[id]/_components/remove-character-form";
import { DiceIcon } from "@/components/icons";
import { LiveRefresh } from "@/components/live-refresh";
import { RowMenu } from "@/components/row-menu";
import { LABEL, MENU_ITEM } from "@/components/styles";
import { migrate } from "@/lib/character/migrate";

type InvitedUser = {
	user_id: string | null;
	display_name: string | null;
	email: string;
};

type AssignedRow = {
	character_id: string;
	characters: {
		id: string;
		name: string;
		owner: string;
		data: unknown;
		discord_enabled: boolean;
	} | null;
};

type PlacementRow = {
	character_id: string;
	campaign_id: string;
	campaigns: { name: string | null } | null;
};

type AllCharacterRow = {
	id: string;
	name: string | null;
	essence: string | null;
	owner: string;
};

function monogram(name: string): string {
	const initials = name
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((word) => word[0]);
	return (initials.join("") || "?").toUpperCase();
}

function playerName(invited: InvitedUser[] | null, ownerId: string): string {
	const match = invited?.find((row) => row.user_id === ownerId);
	return match?.display_name ?? match?.email ?? "Unknown player";
}

export async function AssignedCharacters({
	campaignId,
}: {
	campaignId: string;
}) {
	const { supabase } = await requireAdmin();

	const [
		{ data: assignedRows },
		{ data: placements },
		{ data: allCharacters },
		{ data: invited },
	] = await Promise.all([
		supabase
			.from("campaign_characters")
			.select(
				"character_id, characters(id, name, owner, data, discord_enabled)",
			)
			.eq("campaign_id", campaignId)
			.order("added_at")
			.overrideTypes<AssignedRow[], { merge: false }>(),
		supabase
			.from("campaign_characters")
			.select("character_id, campaign_id, campaigns(name)")
			.overrideTypes<PlacementRow[], { merge: false }>(),
		supabase
			.from("characters")
			.select("id, name, essence, owner")
			.overrideTypes<AllCharacterRow[], { merge: false }>(),
		supabase.rpc("admin_list_users"),
	]);

	const invitedUsers = invited as InvitedUser[] | null;
	const assigned = (assignedRows ?? []).flatMap((row) =>
		row.characters ? [row.characters] : [],
	);
	const assignedIds = new Set(assigned.map((character) => character.id));

	// A character is in at most one campaign, so this maps 1:1.
	const elsewhere = new Map(
		(placements ?? [])
			.filter((row) => row.campaign_id !== campaignId)
			.map((row) => [
				row.character_id,
				row.campaigns?.name?.trim() || "Unnamed",
			]),
	);

	const candidates = (allCharacters ?? []).map((character) => ({
		id: character.id,
		name: character.name?.trim() || "Unnamed",
		essence: character.essence ?? "",
		player: playerName(invitedUsers, character.owner),
		assigned: assignedIds.has(character.id),
		elsewhere: elsewhere.get(character.id) ?? null,
	}));

	const groups = Array.from(
		candidates.reduce((byPlayer, candidate) => {
			const list = byPlayer.get(candidate.player) ?? [];
			list.push(candidate);
			byPlayer.set(candidate.player, list);
			return byPlayer;
		}, new Map<string, typeof candidates>()),
	)
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([player, characters]) => ({ player, characters }));

	return (
		<section className="flex flex-col gap-2">
			<LiveRefresh
				topics={assigned.map((character) => `character:${character.id}`)}
			/>
			<AssignDialog
				campaignId={campaignId}
				assignedCount={assigned.length}
				groups={groups}
			/>

			{/* Scrolls sideways on a phone, wraps from md up. */}
			<ul className="flex gap-2 overflow-x-auto md:flex-wrap md:overflow-visible">
				{assigned.map((character) => {
					const name = character.name?.trim() || "Unnamed";
					const migrated = migrate(character.data);
					const player = playerName(invitedUsers, character.owner);

					return (
						<li
							key={character.id}
							className="notched relative flex w-64 shrink-0 items-center border border-border bg-surface"
						>
							<CharacterSheetDialog character={migrated} player={player}>
								<span
									aria-hidden="true"
									className="grid size-[34px] shrink-0 place-items-center rounded-full bg-edge font-display text-[13px] font-bold text-quiet"
								>
									{monogram(name)}
								</span>
								<span className="flex min-w-0 flex-1 flex-col gap-0.5">
									<span className="truncate font-display text-sm font-bold tracking-[0.05em] text-text uppercase">
										{name}
									</span>
									<span className={LABEL}>
										{player} · {migrated.statuses.length}{" "}
										{migrated.statuses.length === 1 ? "status" : "statuses"}
									</span>
								</span>
								{migrated.themes.length > 0 && (
									<span aria-hidden="true" className="flex shrink-0 gap-[3px]">
										{migrated.themes.map((theme, index) => (
											<span
												// biome-ignore lint/suspicious/noArrayIndexKey: decorative swatch, order is server-fixed.
												key={index}
												data-type={theme.type}
												className="size-2 rounded-[1px] bg-[var(--hue)]"
											/>
										))}
									</span>
								)}
							</CharacterSheetDialog>
							<span
								role="img"
								aria-label={
									character.discord_enabled
										? "Discord rolls on"
										: "Discord rolls off"
								}
								title={
									character.discord_enabled
										? "Discord rolls on"
										: "Discord rolls off"
								}
								className={`pointer-events-none absolute right-1.5 bottom-1 ${
									character.discord_enabled ? "text-positive" : "text-danger"
								}`}
							>
								<DiceIcon className="size-3.5" />
							</span>

							<RowMenu label={`Menu for ${name}`}>
								<Menu.Item
									className={MENU_ITEM}
									render={<Link href={`/character/${character.id}`} />}
								>
									Edit
								</Menu.Item>
								<DiscordRollsForm
									campaignId={campaignId}
									characterId={character.id}
									name={name}
									enabled={character.discord_enabled}
								/>
								<RemoveCharacterForm
									campaignId={campaignId}
									characterId={character.id}
									name={name}
								/>
							</RowMenu>
						</li>
					);
				})}
			</ul>
		</section>
	);
}
