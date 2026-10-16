"use client";

import { Button } from "@base-ui/react/button";
import { Input } from "@base-ui/react/input";
import { useActionState, useState } from "react";
import { setCampaignWebhook } from "@/app/admin/campaigns/_lib/actions";
import { LABEL, PRIMARY, QUIET } from "@/components/styles";

export function DiscordChannelForm({
	campaignId,
	url,
}: {
	campaignId: string;
	url: string;
}) {
	const [editing, setEditing] = useState(false);
	const [error, save, pending] = useActionState(
		async (previous: string | null, form: FormData) => {
			const result = await setCampaignWebhook(previous, form);
			if (result === null) setEditing(false);
			return result;
		},
		null,
	);

	return (
		<div className="flex flex-col gap-1.5">
			<span id="discord-webhook-label" className={LABEL}>
				Discord roll channel webhook
			</span>

			{editing ? (
				<form action={save} className="flex gap-2">
					<input type="hidden" name="id" value={campaignId} />
					<Input
						name="url"
						autoFocus
						autoComplete="off"
						defaultValue={url}
						aria-labelledby="discord-webhook-label"
						placeholder="https://discord.com/api/webhooks/..."
						className="min-h-11 min-w-0 flex-1 rounded-sm border border-border bg-bg px-3 font-mono text-sm text-text"
					/>
					<Button type="submit" disabled={pending} className={PRIMARY}>
						Save
					</Button>
					<Button
						type="button"
						onClick={() => setEditing(false)}
						className={QUIET}
					>
						Cancel
					</Button>
				</form>
			) : (
				<div className="flex items-center gap-3">
					<p className="min-w-0 flex-1 break-all font-mono text-sm text-text">
						{url || (
							<span className="text-dim">
								Not set. Rolls are not posted to Discord.
							</span>
						)}
					</p>
					<Button
						type="button"
						onClick={() => setEditing(true)}
						className={QUIET}
					>
						Edit
					</Button>
				</div>
			)}

			{error && (
				<p role="status" className="font-sans text-[11px] text-negative-text">
					{error}
				</p>
			)}
		</div>
	);
}
