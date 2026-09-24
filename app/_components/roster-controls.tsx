"use client";

import { Button } from "@base-ui/react/button";
import { Dialog } from "@base-ui/react/dialog";
import { Input } from "@base-ui/react/input";
import Link from "next/link";
import { useActionState, useState } from "react";
import { LinkIcon } from "@/app/_components/icons";
import {
	createCharacter,
	deleteCharacter,
	duplicateCharacter,
	importCharacter,
	renameCharacter,
} from "@/lib/actions";
import type { RosterSummary } from "@/lib/roster";

const action =
	"inline-flex min-h-11 min-w-11 items-center justify-center px-2 font-mono text-[10px] tracking-[0.08em] text-dim uppercase";

type CardProps = {
	id: string;
	name: string;
	essence: string;
	shared: boolean;
	/** ISO 8601, for the machine-readable <time>. */
	updatedAt: string;
	/** Formatted on the server, so the client never recomputes it. */
	edited: string;
	/** Parsed on the server: a null or malformed roster_summary already reads as empty here. */
	summary: RosterSummary;
};

export function CharacterCard({
	id,
	name,
	essence,
	shared,
	updatedAt,
	edited,
	summary,
}: CardProps) {
	const [renaming, setRenaming] = useState(false);
	const [renameError, rename, renamePending] = useActionState(
		renameCharacter,
		null,
	);
	const [copyError, copy, copyPending] = useActionState(
		duplicateCharacter,
		null,
	);
	const [deleteError, remove, deletePending] = useActionState(
		deleteCharacter,
		null,
	);
	const [deleteOpen, setDeleteOpen] = useState(false);

	const label = name.trim() || "Unnamed";
	const busy = renamePending || copyPending || deletePending;
	const error = renameError ?? copyError ?? deleteError;

	return (
		<article className="flex flex-col gap-[11px] rounded-md border border-raised bg-surface px-[15px] py-[14px]">
			<div className="flex items-start justify-between gap-3">
				{renaming ? (
					<form
						className="flex flex-1 items-center gap-2"
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
							aria-label="Character name"
							className="min-h-11 w-full rounded-sm border border-border bg-bg px-2 font-display text-[19px] font-bold tracking-[0.05em]"
						/>
						<Button type="submit" className={action}>
							Save
						</Button>
					</form>
				) : (
					<h2
						className={`font-display text-[21px] leading-tight font-bold tracking-[0.05em] uppercase ${name.trim() ? "text-text" : "text-dim"}`}
					>
						<Link
							href={`/character/${id}`}
							className="inline-flex min-h-11 items-center"
						>
							{label}
						</Link>
					</h2>
				)}

				{shared && (
					<span className="flex shrink-0 items-center gap-1 rounded-[3px] border border-border px-1.5 py-0.5 font-mono text-[9px] tracking-[0.08em] text-positive-text uppercase">
						<LinkIcon className="size-2.5 stroke-positive" />
						Shared
					</span>
				)}
			</div>

			<div className="flex items-center gap-[9px]">
				{/* aria-hidden: a picture of what the Essence text already says in words. */}
				{summary.themes.length > 0 && (
					<div aria-hidden="true" className="flex gap-[3px]">
						{summary.themes.map((theme, index) => (
							<div
								// biome-ignore lint/suspicious/noArrayIndexKey: no id, and type/nascent can repeat; order is server-fixed.
								key={index}
								data-type={theme.type ?? undefined}
								style={theme.nascent ? { opacity: 0.28 } : undefined}
								className={`h-1 w-[30px] ${theme.type ? "bg-[var(--hue)]" : "bg-pip"}`}
							/>
						))}
					</div>
				)}
				<p className="font-display text-[11px] font-semibold tracking-[0.16em] text-dim uppercase">
					{essence || "Essence not set"}
				</p>

				{summary.statuses > 0 && (
					<div className="ml-auto flex items-center gap-1.5">
						<span
							aria-hidden="true"
							className="size-1.5 rounded-full bg-negative"
						/>
						<p className="font-sans text-[11.5px] text-negative-text/65">
							{summary.statuses}{" "}
							{summary.statuses === 1 ? "status" : "statuses"} in play
						</p>
					</div>
				)}
			</div>

			<div className="flex items-center justify-between gap-2 border-t border-hairline pt-[11px]">
				<p className="font-sans text-[11.5px] text-faint">
					Edited <time dateTime={updatedAt}>{edited}</time>
				</p>

				<div className="flex items-center">
					<Button
						type="button"
						onClick={() => setRenaming(true)}
						aria-label={`Rename ${label}`}
						className={action}
					>
						Rename
					</Button>

					<form action={copy}>
						<input type="hidden" name="id" value={id} />
						<Button
							type="submit"
							aria-label={`Duplicate ${label}`}
							className={action}
						>
							Copy
						</Button>
					</form>

					<Button
						type="button"
						onClick={() => setDeleteOpen(true)}
						aria-label={`Delete ${label}`}
						className={action}
					>
						Delete
					</Button>
				</div>
			</div>

			<p
				role="status"
				className={`font-sans text-[11px] ${error ? "text-negative-text" : "text-dim"}`}
			>
				{busy ? "Working" : (error ?? "")}
			</p>

			<Dialog.Root open={deleteOpen} onOpenChange={setDeleteOpen}>
				<Dialog.Portal>
					<Dialog.Backdrop className="fixed inset-0 bg-bg/80" />
					<Dialog.Popup className="fixed inset-0 m-auto h-fit max-h-[85vh] w-[85vw] max-w-[320px] overflow-y-auto rounded-md border border-border bg-surface p-5 text-text">
						<Dialog.Title className="font-display text-base font-bold tracking-[0.08em] uppercase">
							Delete {label}?
						</Dialog.Title>
						<p className="mt-2 font-sans text-sm text-dim">
							The character and its sheet go for good. This cannot be undone.
						</p>

						<div className="mt-5 flex items-center justify-end gap-2">
							<Dialog.Close className="inline-flex min-h-11 items-center rounded-sm border border-border px-4 font-display text-sm font-semibold tracking-[0.08em] uppercase">
								Cancel
							</Dialog.Close>

							<form action={remove} onSubmit={() => setDeleteOpen(false)}>
								<input type="hidden" name="id" value={id} />
								<Button
									type="submit"
									className="inline-flex min-h-11 items-center rounded-sm bg-danger px-4 font-display text-sm font-bold tracking-[0.08em] text-bg uppercase"
								>
									Delete
								</Button>
							</form>
						</div>
					</Dialog.Popup>
				</Dialog.Portal>
			</Dialog.Root>
		</article>
	);
}

export function NewCharacterBar() {
	const [error, create, pending] = useActionState<string | null, FormData>(
		createCharacter,
		null,
	);

	return (
		<form action={create}>
			<div
				style={{
					filter:
						"drop-shadow(0 0 14px color-mix(in srgb, var(--color-primary) 35%, transparent))",
				}}
			>
				<Button
					type="submit"
					disabled={pending}
					className="flex h-14 w-full items-center justify-center gap-2 rounded-[5px] bg-primary font-display text-base font-bold tracking-[0.12em] text-bg uppercase [clip-path:polygon(0_0,100%_0,100%_72%,95%_100%,0_100%)]"
				>
					<span aria-hidden="true" className="text-xl leading-none">
						+
					</span>
					New character
				</Button>
			</div>

			<p
				role="status"
				className={`pt-1 text-center font-sans text-[11px] ${error ? "text-negative-text" : "text-dim"}`}
			>
				{pending ? "Creating" : (error ?? "")}
			</p>
		</form>
	);
}

export function ImportBar() {
	const [pending, setPending] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function onChange(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file) return;

		setPending(true);
		setError(null);
		const form = new FormData();
		form.set("document", await file.text());
		setError(await importCharacter(null, form));
		setPending(false);
	}

	return (
		<div className="pt-2 text-center">
			<label className="inline-flex min-h-11 cursor-pointer items-center px-2 font-mono text-[10px] tracking-[0.08em] text-dim uppercase">
				<input
					type="file"
					accept="application/json"
					disabled={pending}
					onChange={onChange}
					className="sr-only"
				/>
				Import a character
			</label>

			<p
				role="status"
				className={`font-sans text-[11px] ${error ? "text-negative-text" : "text-dim"}`}
			>
				{pending ? "Importing" : (error ?? "")}
			</p>
		</div>
	);
}
