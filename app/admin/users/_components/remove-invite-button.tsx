"use client";

import { Button } from "@base-ui/react/button";
import { useState } from "react";
import { removeInvite } from "@/app/admin/users/_lib/actions";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DANGER } from "@/components/styles";

export function RemoveInviteButton({
	target,
	name,
}: {
	target: string;
	name: string;
}) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button
				onClick={() => setOpen(true)}
				aria-label={`Remove invite for ${name}`}
				className="min-h-11 px-3 font-mono text-[10px] tracking-[0.08em] text-faint uppercase"
			>
				Remove
			</Button>
			<ConfirmDialog
				open={open}
				onOpenChange={setOpen}
				title="Remove invite?"
				description={`${name} loses access the next time their session refreshes (up to an hour).`}
			>
				<form action={removeInvite} onSubmit={() => setOpen(false)}>
					<input type="hidden" name="target" value={target} />
					<Button type="submit" className={DANGER}>
						Remove invite
					</Button>
				</form>
			</ConfirmDialog>
		</>
	);
}
