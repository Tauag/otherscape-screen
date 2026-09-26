"use client";

import { Button } from "@base-ui/react/button";
import { Checkbox } from "@base-ui/react/checkbox";
import { Dialog } from "@base-ui/react/dialog";
import { Input } from "@base-ui/react/input";
import { useActionState, useState } from "react";
import { assignCharacters } from "@/app/admin/campaigns/_lib/actions";
import { LabelAction } from "@/components/label-action";
import { LABEL } from "@/components/styles";

type Candidate = {
	id: string;
	name: string;
	essence: string;
	player: string;
	assigned: boolean;
};

type Group = { player: string; characters: Candidate[] };

export function AssignDialog({
	campaignId,
	assignedCount,
	groups,
}: {
	campaignId: string;
	assignedCount: number;
	groups: Group[];
}) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [selected, setSelected] = useState<Set<string>>(new Set());
	const [error, assign, pending] = useActionState(assignCharacters, null);

	function reset() {
		setQuery("");
		setSelected(new Set());
	}

	const needle = query.trim().toLowerCase();
	const visible = groups
		.map((group) => ({
			player: group.player,
			characters: group.characters.filter(
				(character) =>
					!needle ||
					character.name.toLowerCase().includes(needle) ||
					group.player.toLowerCase().includes(needle),
			),
		}))
		.filter((group) => group.characters.length > 0);

	return (
		<>
			<Dialog.Root
				open={open}
				onOpenChange={(next) => {
					setOpen(next);
					if (!next) reset();
				}}
			>
				<Dialog.Trigger
					render={<LabelAction label={`Characters · ${assignedCount}`} />}
				>
					+ Character
				</Dialog.Trigger>

				<Dialog.Portal>
					<Dialog.Backdrop className="fixed inset-0 bg-bg/80" />
					<Dialog.Popup className="fixed inset-0 m-auto flex h-fit max-h-[85vh] w-[85vw] max-w-[420px] flex-col gap-3.5 overflow-y-auto rounded-md border border-border bg-surface p-5 text-text">
						<Dialog.Title className="font-display text-base font-bold tracking-[0.08em] uppercase">
							Assign characters
						</Dialog.Title>

						<Input
							autoFocus
							autoComplete="off"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							aria-label="Search characters"
							placeholder="Search by character or player"
							className="min-h-11 w-full rounded-sm border border-border bg-bg px-3 font-sans text-sm text-text"
						/>

						<form
							action={assign}
							onSubmit={() => {
								setOpen(false);
								reset();
							}}
							className="flex flex-col gap-3.5"
						>
							<input type="hidden" name="campaignId" value={campaignId} />

							<div className="flex flex-col gap-0.5">
								{visible.map((group) => (
									<div key={group.player} className="flex flex-col gap-0.5">
										<span className={`${LABEL} px-2.5 pt-1.5`}>
											{group.player}
										</span>
										{group.characters.map((character) => {
											const checked =
												character.assigned || selected.has(character.id);
											return (
												<label
													key={character.id}
													htmlFor={`assign-${character.id}`}
													className={`flex min-h-11 items-center gap-3 rounded-sm px-2.5 ${
														character.assigned
															? "opacity-55"
															: "hover:bg-white/[0.03]"
													}`}
												>
													<Checkbox.Root
														id={`assign-${character.id}`}
														name="characterId"
														value={character.id}
														checked={checked}
														disabled={character.assigned}
														onCheckedChange={(next) =>
															setSelected((current) => {
																const updated = new Set(current);
																if (next) updated.add(character.id);
																else updated.delete(character.id);
																return updated;
															})
														}
														className="flex size-[18px] shrink-0 items-center justify-center rounded-[2px] border border-border bg-bg data-[checked]:border-primary data-[checked]:bg-primary"
													>
														<Checkbox.Indicator className="flex text-bg">
															<svg
																aria-hidden="true"
																width="12"
																height="12"
																viewBox="0 0 24 24"
																fill="none"
																stroke="currentColor"
																strokeWidth="3"
																strokeLinecap="round"
																strokeLinejoin="round"
															>
																<path d="M20 6 9 17l-5-5" />
															</svg>
														</Checkbox.Indicator>
													</Checkbox.Root>
													<span className="flex-1 font-display text-sm font-semibold tracking-[0.05em] uppercase">
														{character.name}
													</span>
													{(character.assigned || character.essence) && (
														<span className={LABEL}>
															{character.assigned
																? "In campaign"
																: character.essence}
														</span>
													)}
												</label>
											);
										})}
									</div>
								))}

								{visible.length === 0 && (
									<p className="px-2.5 py-3 font-sans text-sm text-dim">
										No characters match.
									</p>
								)}
							</div>

							<div className="flex items-center justify-end gap-2 pt-1">
								<Dialog.Close className="inline-flex min-h-11 items-center rounded-sm border border-border px-4 font-display text-sm font-semibold tracking-[0.08em] uppercase">
									Cancel
								</Dialog.Close>
								<Button
									type="submit"
									disabled={selected.size === 0 || pending}
									className="inline-flex min-h-11 items-center rounded-sm bg-primary px-4 font-display text-sm font-bold tracking-[0.08em] text-bg uppercase disabled:opacity-40"
								>
									Assign {selected.size}
								</Button>
							</div>
						</form>
					</Dialog.Popup>
				</Dialog.Portal>
			</Dialog.Root>

			{error && (
				<p role="status" className="font-sans text-[11px] text-negative-text">
					{error}
				</p>
			)}
		</>
	);
}
