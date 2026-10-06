"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Button } from "@base-ui/react/button";
import { Input } from "@base-ui/react/input";
import Link from "next/link";
import { useActionState, useState } from "react";
import {
	deleteCampaign,
	renameCampaign,
} from "@/app/admin/campaigns/_lib/actions";
import {
	DANGER_FILLED,
	DIALOG_BACKDROP,
	DIALOG_POPUP,
	HEADING,
	LABEL,
	QUIET,
} from "@/components/styles";

type Props = {
	id: string;
	name: string;
	challengeCount: number;
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
	challengeCount,
	storyTagCount,
	characterCount,
	updatedAt,
	edited,
}: Props) {
	const label = name.trim() || "Unnamed";
	const [renaming, setRenaming] = useState(false);
	const [renameError, rename, renamePending] = useActionState(
		renameCampaign,
		null,
	);
	const [error, remove, pending] = useActionState(deleteCampaign, null);
	const [deleteOpen, setDeleteOpen] = useState(false);

	return (
		<article className="flex flex-col gap-2 rounded-md border border-border bg-surface px-3 py-2.5">
			{renaming ? (
				<form
					className="flex items-center gap-2"
					onKeyDown={(event) => event.key === "Escape" && setRenaming(false)}
					action={(form) => {
						setRenaming(false);
						rename(form);
					}}
				>
					<input type="hidden" name="id" value={id} />
					<Input
						autoFocus
						autoComplete="off"
						name="name"
						defaultValue={name}
						aria-label="Campaign name"
						className="min-h-11 w-full rounded-sm border border-border bg-bg px-2 font-display text-base font-bold tracking-[0.05em]"
					/>
					<Button
						type="submit"
						className="inline-flex min-h-11 items-center px-2 font-mono text-[10px] tracking-[0.08em] text-dim uppercase"
					>
						Save
					</Button>
				</form>
			) : (
				<Link
					href={`/admin/campaigns/${id}`}
					className="flex min-w-0 flex-col gap-0.5"
				>
					<span className="truncate font-display text-base font-bold tracking-[0.05em] text-text uppercase">
						{label}
					</span>
					<span className={LABEL}>
						{plural(challengeCount, "challenge")} ·{" "}
						{plural(storyTagCount, "story tag")} ·{" "}
						{plural(characterCount, "character")}
					</span>
				</Link>
			)}

			<div className="flex items-center justify-between gap-2 border-t border-hairline pt-2">
				<p className="font-sans text-[11.5px] text-faint">
					Edited <time dateTime={updatedAt}>{edited}</time>
				</p>

				<div className="flex items-center">
					<Button
						type="button"
						onClick={() => setRenaming(true)}
						aria-label={`Rename ${label}`}
						className="inline-flex min-h-11 items-center px-2 font-mono text-[10px] tracking-[0.08em] text-dim uppercase"
					>
						Rename
					</Button>

					<Button
						type="button"
						onClick={() => setDeleteOpen(true)}
						aria-label={`Delete ${label}`}
						className="inline-flex min-h-11 items-center px-2 font-mono text-[10px] tracking-[0.08em] text-danger-text uppercase"
					>
						Delete
					</Button>
				</div>
			</div>

			{(renameError ?? error) && (
				<p role="status" className="font-sans text-[11px] text-negative-text">
					{renamePending ? "Working" : (renameError ?? error)}
				</p>
			)}

			<AlertDialog.Root open={deleteOpen} onOpenChange={setDeleteOpen}>
				<AlertDialog.Portal>
					<AlertDialog.Backdrop className={DIALOG_BACKDROP} />
					<AlertDialog.Popup className={DIALOG_POPUP}>
						<AlertDialog.Title className={HEADING}>
							Delete {label}?
						</AlertDialog.Title>
						<AlertDialog.Description className="mt-2 font-sans text-sm text-dim">
							This deletes its {plural(challengeCount, "challenge")} and{" "}
							{plural(storyTagCount, "story tag")}. The {characterCount}{" "}
							assigned{" "}
							{characterCount === 1 ? "character stays" : "characters stay"} as{" "}
							{characterCount === 1 ? "it is" : "they are"}; only{" "}
							{characterCount === 1 ? "its" : "their"} link to this campaign
							goes.
						</AlertDialog.Description>

						<div className="mt-5 flex items-center justify-end gap-2">
							<AlertDialog.Close className={QUIET}>Cancel</AlertDialog.Close>

							<form action={remove} onSubmit={() => setDeleteOpen(false)}>
								<input type="hidden" name="id" value={id} />
								<Button
									type="submit"
									disabled={pending}
									className={DANGER_FILLED}
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
