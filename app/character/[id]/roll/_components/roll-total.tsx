"use client";

import { Button } from "@base-ui/react/button";
import { useState } from "react";
import { ConfirmDialog } from "@/app/character/[id]/_components/confirm-dialog";
import { CopyIcon } from "@/app/character/[id]/_components/icons";
import { QUIET, REMOVE_BUTTON } from "@/app/character/[id]/_components/styles";
import { signed } from "@/app/character/[id]/_lib/roll-selection";
import { LABEL } from "@/components/styles";

/** The Discord slash command that reproduces this roll's power modifier. */
function rollCommand(total: number): string {
	if (total === 0) return "/roll 2d6";
	return `/roll 2d6${total > 0 ? "+" : ""}${total}`;
}

export function RollTotal({
	total,
	modifier,
	onRoll,
	canMitigate,
	onStartMitigation,
}: {
	total: number;
	modifier: number;
	/** Called when the player commits to this roll, to clear the picked tags. */
	onRoll: () => void;
	/** Whether the roll just finalized spent any tags, so a mitigation roll
	 *  started now would have something to lock out. */
	canMitigate: boolean;
	/** Locks out the tags just spent, then lets the player pick a fresh set
	 *  for a mitigation roll. */
	onStartMitigation: () => void;
}) {
	const [open, setOpen] = useState(false);
	const [copied, setCopied] = useState(false);
	// Snapshot on roll, so clearing the tag selection right after doesn't
	// change the command this dialog is already showing.
	const [command, setCommand] = useState(rollCommand(total));

	async function copy() {
		await navigator.clipboard.writeText(command);
		setCopied(true);
	}

	return (
		<div className="shrink-0 border-t border-edge bg-chrome">
			<div className="flex items-stretch gap-3 px-5 pt-4 pb-4">
				<Button
					type="button"
					onClick={() => {
						setCommand(rollCommand(total));
						setCopied(false);
						setOpen(true);
						onRoll();
					}}
					className="flex flex-1 flex-col items-center justify-center rounded-[5px] bg-primary font-display text-[19px] font-bold tracking-[0.1em] text-bg uppercase [clip-path:polygon(0_0,100%_0,100%_74%,92%_100%,0_100%)]"
				>
					Roll 2d6
				</Button>

				<p className="flex flex-col items-end justify-center">
					<span className={LABEL}>Power</span>
					<span className="font-display text-[44px] leading-[0.95] font-bold text-noise [text-shadow:0_0_26px_color-mix(in_oklab,var(--color-noise)_50%,transparent)]">
						{signed(total)}
					</span>
					<span className="font-mono text-[11px] text-dim">
						mod {signed(modifier)}
					</span>
				</p>
			</div>

			<ConfirmDialog
				open={open}
				onOpenChange={setOpen}
				title="Roll 2d6"
				description="Rolling here is still under construction. Roll on Discord instead:"
				cancelLabel="Close"
			>
				<div className="flex items-stretch rounded-sm border border-border bg-bg">
					<p className="min-w-0 flex-1 self-center truncate px-3 py-3 font-mono text-sm text-text">
						{command}
					</p>
					<Button
						type="button"
						aria-label="Copy command"
						onClick={copy}
						className={`${REMOVE_BUTTON} w-11`}
					>
						<CopyIcon />
					</Button>
				</div>
				{copied && (
					<p className="font-sans text-xs text-dim text-positive">Copied.</p>
				)}
				{canMitigate && (
					<Button
						type="button"
						onClick={() => {
							onStartMitigation();
							setOpen(false);
						}}
						className={`${QUIET} self-start`}
					>
						Roll mitigation
					</Button>
				)}
			</ConfirmDialog>
		</div>
	);
}
