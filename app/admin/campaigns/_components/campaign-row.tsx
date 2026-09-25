"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Button } from "@base-ui/react/button";
import Link from "next/link";
import { useActionState, useState } from "react";
import { deleteCampaign } from "@/app/admin/campaigns/_lib/actions";
import { LABEL } from "@/components/styles";

type Props = {
	id: string;
	name: string;
	npcCount: number;
	storyTagCount: number;
	characterCount: number;
	/** ISO 8601, for the machine-readable <time>. */
	updatedAt: string;
	/** Formatted on the server, so the client never recomputes it. */
	edited: string;
};

function plural(count: number, noun: string): string {
	return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

export function CampaignRow({
	id,
	name,
	npcCount,
	storyTagCount,
	characterCount,
	updatedAt,
	edited,
}: Props) {
	const label = name.trim() || "Unnamed";
	const [error, remove, pending] = useActionState(deleteCampaign, null);
	const [deleteOpen, setDeleteOpen] = useState(false);

	return (
		<article className="flex flex-col gap-2 rounded-md border border-border bg-surface px-3 py-2.5">
			<Link
				href={`/admin/campaigns/${id}`}
				className="flex min-w-0 flex-col gap-0.5"
			>
				<span className="truncate font-display text-base font-bold tracking-[0.05em] text-text uppercase">
					{label}
				</span>
				<span className={LABEL}>
					{plural(npcCount, "NPC")} · {plural(storyTagCount, "story tag")} ·{" "}
					{plural(characterCount, "character")}
				</span>
			</Link>

			<div className="flex items-center justify-between gap-2 border-t border-hairline pt-2">
				<p className="font-sans text-[11.5px] text-faint">
					Edited <time dateTime={updatedAt}>{edited}</time>
				</p>

				<Button
					type="button"
					onClick={() => setDeleteOpen(true)}
					aria-label={`Delete ${label}`}
					className="inline-flex min-h-11 items-center px-2 font-mono text-[10px] tracking-[0.08em] text-danger-text uppercase"
				>
					Delete
				</Button>
			</div>

			{error && (
				<p role="status" className="font-sans text-[11px] text-negative-text">
					{error}
				</p>
			)}

			<AlertDialog.Root open={deleteOpen} onOpenChange={setDeleteOpen}>
				<AlertDialog.Portal>
					<AlertDialog.Backdrop className="fixed inset-0 bg-bg/80" />
					<AlertDialog.Popup className="fixed inset-0 m-auto h-fit max-h-[85vh] w-[85vw] max-w-[380px] overflow-y-auto rounded-md border border-border bg-surface p-5 text-text">
						<AlertDialog.Title className="font-display text-base font-bold tracking-[0.08em] uppercase">
							Delete {label}?
						</AlertDialog.Title>
						<AlertDialog.Description className="mt-2 font-sans text-sm text-dim">
							This deletes its {plural(npcCount, "NPC")} and{" "}
							{plural(storyTagCount, "story tag")}. The {characterCount}{" "}
							assigned{" "}
							{characterCount === 1 ? "character stays" : "characters stay"} as{" "}
							{characterCount === 1 ? "it is" : "they are"}; only{" "}
							{characterCount === 1 ? "its" : "their"} link to this campaign
							goes.
						</AlertDialog.Description>

						<div className="mt-5 flex items-center justify-end gap-2">
							<AlertDialog.Close className="inline-flex min-h-11 items-center rounded-sm border border-border px-4 font-display text-sm font-semibold tracking-[0.08em] uppercase">
								Cancel
							</AlertDialog.Close>

							<form action={remove} onSubmit={() => setDeleteOpen(false)}>
								<input type="hidden" name="id" value={id} />
								<Button
									type="submit"
									disabled={pending}
									className="inline-flex min-h-11 items-center rounded-sm bg-danger px-4 font-display text-sm font-bold tracking-[0.08em] text-bg uppercase"
								>
									Delete
								</Button>
							</form>
						</div>
					</AlertDialog.Popup>
				</AlertDialog.Portal>
			</AlertDialog.Root>
		</article>
	);
}
