"use client";

import { Button } from "@base-ui/react/button";
import { Input } from "@base-ui/react/input";
import { useActionState } from "react";
import { inviteUser } from "@/app/admin/users/_lib/actions";
import { LABEL, PRIMARY } from "@/components/styles";

export function InviteForm() {
	const [error, invite, pending] = useActionState(inviteUser, null);

	return (
		<form action={invite} className="flex flex-col gap-2 pb-3">
			<label htmlFor="invite-target" className={LABEL}>
				Invite by email or Discord ID
			</label>
			<div className="flex gap-2">
				<Input
					id="invite-target"
					name="target"
					autoComplete="off"
					placeholder="name@example.com or 123456789012345678"
					className="min-h-11 w-full flex-1 rounded-sm border border-border bg-bg px-3 font-sans text-sm text-text"
				/>
				<Button type="submit" disabled={pending} className={PRIMARY}>
					Invite
				</Button>
			</div>
			<p
				role="status"
				className={`font-sans text-[11px] ${error ? "text-negative-text" : "text-dim"}`}
			>
				{error ??
					"Discord ID: turn on Developer Mode, right-click the user, Copy User ID."}
			</p>
		</form>
	);
}
