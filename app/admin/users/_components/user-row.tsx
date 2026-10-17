import Link from "next/link";
import { RemoveInviteButton } from "@/app/admin/users/_components/remove-invite-button";
import { LABEL } from "@/components/styles";
import { relativeTime } from "@/lib/relative-time";

export type InvitedUser = {
	email: string | null;
	discord_id: string | null;
	role: string;
	invited_at: string;
	user_id: string | null;
	display_name: string | null;
	last_sign_in_at: string | null;
};

export function UserRow({ invited }: { invited: InvitedUser }) {
	const identity = invited.email ?? `Discord ${invited.discord_id}`;
	const className =
		"flex min-w-0 flex-1 flex-col gap-0.5 px-3 py-2.5 outline-offset-[-2px]";
	const content = (
		<>
			<span className="truncate font-sans text-sm text-text">
				{invited.display_name ?? identity}
			</span>
			<span className={LABEL}>
				{invited.display_name && `${identity} · `}
				{invited.role}
				{" · "}
				{invited.last_sign_in_at
					? `active ${relativeTime(invited.last_sign_in_at)}`
					: "never signed in"}
			</span>
		</>
	);

	return (
		<div className="flex items-center rounded-md border border-border bg-surface">
			{invited.user_id ? (
				<Link href={`/admin/users/${invited.user_id}`} className={className}>
					{content}
				</Link>
			) : (
				<div className={className}>{content}</div>
			)}
			<RemoveInviteButton
				target={invited.email ?? invited.discord_id ?? ""}
				name={identity}
			/>
		</div>
	);
}
