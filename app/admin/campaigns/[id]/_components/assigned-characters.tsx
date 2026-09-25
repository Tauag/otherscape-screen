import Link from "next/link";
import { requireAdmin } from "@/app/admin/_lib/require-admin";
import { AssignDialog } from "@/app/admin/campaigns/[id]/_components/assign-dialog";
import { RemoveCharacterForm } from "@/app/admin/campaigns/[id]/_components/remove-character-form";
import { LABEL } from "@/components/styles";
import { migrate } from "@/lib/character/migrate";

type InvitedUser = {
	user_id: string | null;
	display_name: string | null;
	email: string;
};

type AssignedRow = {
	character_id: string;
	characters: { id: string; name: string; owner: string; data: unknown } | null;
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

	const [{ data: assignedRows }, { data: allCharacters }, { data: invited }] =
		await Promise.all([
			supabase
				.from("campaign_characters")
				.select("character_id, characters(id, name, owner, data)")
				.eq("campaign_id", campaignId)
				.order("added_at")
				.overrideTypes<AssignedRow[], { merge: false }>(),
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

	const candidates = (allCharacters ?? []).map((character) => ({
		id: character.id,
		name: character.name?.trim() || "Unnamed",
		essence: character.essence ?? "",
		player: playerName(invitedUsers, character.owner),
		assigned: assignedIds.has(character.id),
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
			<div className="flex items-center justify-between gap-2">
				<span className={LABEL}>Characters · {assigned.length}</span>
			</div>

			{assigned.map((character) => {
				const name = character.name?.trim() || "Unnamed";
				const migrated = migrate(character.data);
				const player = playerName(invitedUsers, character.owner);

				return (
					<div
						key={character.id}
						className="flex items-center rounded-md border border-border bg-surface"
					>
						<Link
							href={`/admin/campaigns/${campaignId}/characters/${character.id}`}
							className="flex min-w-0 flex-1 items-center gap-2.5 px-2.5 py-2"
						>
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
						</Link>

						<RemoveCharacterForm
							campaignId={campaignId}
							characterId={character.id}
							name={name}
						/>
					</div>
				);
			})}

			<AssignDialog campaignId={campaignId} groups={groups} />
		</section>
	);
}
