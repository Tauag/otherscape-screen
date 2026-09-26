import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/app/admin/_lib/require-admin";
import { RosterAppBar } from "@/components/roster-app-bar";
import { LABEL } from "@/components/styles";
import { accountName } from "@/lib/account-name";
import { relativeTime } from "@/lib/relative-time";

export const metadata: Metadata = { title: "Admin · Characters" };

type CharacterRow = {
	id: string;
	name: string | null;
	essence: string | null;
	updated_at: string;
};

type InvitedUser = { user_id: string | null; display_name: string | null };

export default async function AdminUserPage({
	params,
}: PageProps<"/admin/users/[userId]">) {
	const { userId } = await params;
	const { supabase, user } = await requireAdmin();

	const [{ data: characters, error }, { data: invited }] = await Promise.all([
		supabase
			.from("characters")
			.select("id, name, essence, updated_at")
			.eq("owner", userId)
			.order("updated_at", { ascending: false })
			.overrideTypes<CharacterRow[], { merge: false }>(),
		supabase.rpc("admin_list_users"),
	]);

	const target = (invited as InvitedUser[] | null)?.find(
		(row) => row.user_id === userId,
	);

	return (
		<main className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
			<RosterAppBar
				title={target?.display_name ?? "Characters"}
				accountName={accountName(user)}
				isAdmin
			/>

			<div className="flex flex-1 flex-col gap-1 px-5 pb-4">
				{error && (
					<p className="font-sans text-sm text-negative-text">
						Could not load characters. Reload the page.
					</p>
				)}

				{characters?.length === 0 && (
					<p className="font-sans text-sm text-dim">No characters yet.</p>
				)}

				<div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{characters?.map((character) => (
						<Link
							key={character.id}
							href={`/admin/users/${userId}/${character.id}`}
							className="flex flex-col gap-0.5 rounded-md border border-border bg-surface px-3 py-2.5"
						>
							<span className="font-sans text-sm text-text">
								{character.name?.trim() || "Unnamed"}
							</span>
							<span className={LABEL}>
								{character.essence || "No essence"}
								{" · edited "}
								{relativeTime(character.updated_at)}
							</span>
						</Link>
					))}
				</div>
			</div>
		</main>
	);
}
