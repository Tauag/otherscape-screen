import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/app/admin/_lib/require-admin";
import { ShareSheet } from "@/components/share-sheet";
import { migrate } from "@/lib/character/migrate";

type InvitedUser = {
	user_id: string | null;
	display_name: string | null;
	email: string;
};

export default async function CampaignCharacterPage({
	params,
}: PageProps<"/admin/campaigns/[id]/characters/[characterId]">) {
	const { id, characterId } = await params;
	const { supabase } = await requireAdmin();

	const [
		{ data: link },
		{ data: campaign },
		{ data: character, error },
		{ data: invited },
	] = await Promise.all([
		supabase
			.from("campaign_characters")
			.select("character_id")
			.eq("campaign_id", id)
			.eq("character_id", characterId)
			.maybeSingle(),
		supabase
			.from("campaigns")
			.select("name")
			.eq("id", id)
			.maybeSingle()
			.overrideTypes<{ name: string }, { merge: false }>(),
		supabase
			.from("characters")
			.select("data, owner")
			.eq("id", characterId)
			.maybeSingle()
			.overrideTypes<{ data: unknown; owner: string }, { merge: false }>(),
		supabase.rpc("admin_list_users"),
	]);

	// Only a character actually assigned to this campaign gets a read-only
	// view here; everything else 404s, same as an unknown id would.
	if (!link || error || !character) notFound();

	const invitedUsers = invited as InvitedUser[] | null;
	const player = invitedUsers?.find((row) => row.user_id === character.owner);
	const playerName = player?.display_name ?? player?.email ?? "Unknown player";

	return (
		<>
			<div className="mx-auto flex w-full max-w-md items-center justify-between gap-3 px-5 pt-6 md:max-w-3xl xl:max-w-5xl">
				<Link
					href={`/admin/campaigns/${id}`}
					className="font-mono text-[10px] tracking-[0.08em] text-dim uppercase"
				>
					{campaign?.name?.trim() || "Back"}
				</Link>
				<Link
					href={`/character/${characterId}`}
					className="font-mono text-[10px] tracking-[0.08em] text-primary uppercase"
				>
					Edit
				</Link>
			</div>
			<ShareSheet
				character={migrate(character.data)}
				subtitle={`Read-only · ${playerName}'s character`}
			/>
		</>
	);
}
