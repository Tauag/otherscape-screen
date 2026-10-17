import type { Metadata } from "next";
import { requireAdmin } from "@/app/admin/_lib/require-admin";
import { InviteForm } from "@/app/admin/users/_components/invite-form";
import {
	type InvitedUser,
	UserRow,
} from "@/app/admin/users/_components/user-row";
import { RosterAppBar } from "@/components/roster-app-bar";
import { accountName } from "@/lib/account-name";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage() {
	const { supabase, user } = await requireAdmin();

	const { data, error } = await supabase.rpc("admin_list_users");
	const users = data as InvitedUser[] | null;

	return (
		<main className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
			<RosterAppBar
				title="Invited users"
				accountName={accountName(user)}
				isAdmin
			/>

			<div className="flex flex-1 flex-col gap-1 px-5 pb-4">
				<InviteForm />
				{error && (
					<p className="font-sans text-sm text-negative-text">
						Could not load invited users. Reload the page.
					</p>
				)}

				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{users?.map((invited) => (
						<UserRow
							key={invited.email ?? invited.discord_id}
							invited={invited}
						/>
					))}
				</div>
			</div>
		</main>
	);
}
