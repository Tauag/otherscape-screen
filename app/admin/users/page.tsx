import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/app/admin/_lib/require-admin";
import { RosterAppBar } from "@/components/roster-app-bar";
import { LABEL } from "@/components/styles";
import { accountName } from "@/lib/account-name";
import { relativeTime } from "@/lib/relative-time";

export const metadata: Metadata = { title: "Admin" };

type InvitedUser = {
	email: string;
	role: string;
	invited_at: string;
	user_id: string | null;
	display_name: string | null;
	last_sign_in_at: string | null;
};

export default async function AdminPage() {
	const { supabase, user } = await requireAdmin();

	const { data, error } = await supabase.rpc("admin_list_users");
	const users = data as InvitedUser[] | null;

	return (
		<main className="mx-auto flex w-full max-w-md flex-1 flex-col">
			<RosterAppBar
				title="Invited users"
				accountName={accountName(user)}
				isAdmin
			/>

			<div className="flex flex-1 flex-col gap-1 px-5 pb-4">
				{error && (
					<p className="font-sans text-sm text-negative-text">
						Could not load invited users. Reload the page.
					</p>
				)}

				{users?.map((invited) => (
					<UserRow key={invited.email} invited={invited} />
				))}
			</div>
		</main>
	);
}

function UserRow({ invited }: { invited: InvitedUser }) {
	const className =
		"flex items-center justify-between gap-3 rounded-md border border-border bg-surface px-3 py-2.5";
	const content = (
		<div className="flex min-w-0 flex-col gap-0.5">
			<span className="truncate font-sans text-sm text-text">
				{invited.display_name ?? invited.email}
			</span>
			<span className={LABEL}>
				{invited.display_name && `${invited.email} · `}
				{invited.role}
				{" · "}
				{invited.last_sign_in_at
					? `active ${relativeTime(invited.last_sign_in_at)}`
					: "never signed in"}
			</span>
		</div>
	);

	if (!invited.user_id) return <div className={className}>{content}</div>;

	return (
		<Link href={`/admin/users/${invited.user_id}`} className={className}>
			{content}
		</Link>
	);
}
