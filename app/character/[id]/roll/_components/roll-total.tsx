"use client";

import { Button } from "@base-ui/react/button";
import { useParams } from "next/navigation";
import { useState } from "react";
import { CopyIcon } from "@/app/character/[id]/_components/icons";
import { REMOVE_BUTTON } from "@/app/character/[id]/_components/styles";
import { rollDice } from "@/app/character/[id]/_lib/roll-action";
import {
	type Dice,
	outcome,
	type RollLine,
} from "@/app/character/[id]/_lib/roll-message";
import { signed } from "@/app/character/[id]/_lib/roll-selection";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { LABEL, QUIET } from "@/components/styles";

/** The Discord slash command that reproduces this roll's power modifier. */
function rollCommand(total: number): string {
	if (total === 0) return "/roll 2d6";
	return `/roll 2d6${total > 0 ? "+" : ""}${total}`;
}

// The tumble runs at least this long, so the reveal lands about when the
// Discord post does and the table sees it together.
const TUMBLE_MS = 1200;
const d6 = () => Math.floor(Math.random() * 6) + 1;

const OUTCOME_CLASS = {
	"Strong hit": "text-positive",
	"Mixed hit": "text-text",
	Miss: "text-negative",
};

type Roll =
	| { state: "rolling" }
	| { state: "done"; dice: Dice; posted: boolean }
	| { state: "failed"; error: string };

export function RollTotal({
	total,
	modifier,
	lines,
	mitigating,
	onRoll,
	canMitigate,
	onStartMitigation,
}: {
	total: number;
	modifier: number;
	/** `power().lines` with names, for the Discord post. */
	lines: RollLine[];
	/** Whether this roll mitigates the consequence of the last one. */
	mitigating: boolean;
	/** Called when the player commits to this roll, to clear the picked tags. */
	onRoll: () => void;
	/** Whether the roll just finalized spent any tags, so a mitigation roll
	 *  started now would have something to lock out. */
	canMitigate: boolean;
	/** Locks out the tags just spent, then lets the player pick a fresh set
	 *  for a mitigation roll. */
	onStartMitigation: () => void;
}) {
	const { id } = useParams<{ id: string }>();
	const [open, setOpen] = useState(false);
	const [roll, setRoll] = useState<Roll>({ state: "rolling" });
	const [faces, setFaces] = useState<Dice>([1, 1]);
	const [copied, setCopied] = useState(false);
	// Snapshot on roll, so clearing the tag selection right after doesn't
	// change the power this dialog is already showing.
	const [rolledPower, setRolledPower] = useState(total);

	async function start() {
		setRolledPower(total);
		setCopied(false);
		setRoll({ state: "rolling" });
		setOpen(true);
		onRoll();

		const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const tumble = still
			? undefined
			: setInterval(() => setFaces([d6(), d6()]), 90);
		const [result] = await Promise.all([
			rollDice(id, lines, mitigating).catch(() => ({
				error: "Could not reach the server.",
			})),
			new Promise((resolve) => setTimeout(resolve, TUMBLE_MS)),
		]);
		clearInterval(tumble);

		if (result.error !== null) {
			setRoll({ state: "failed", error: result.error });
			return;
		}
		setFaces(result.dice);
		setRoll({ state: "done", dice: result.dice, posted: result.posted });
	}

	async function copy() {
		await navigator.clipboard.writeText(rollCommand(rolledPower));
		setCopied(true);
	}

	const score =
		roll.state === "done" ? roll.dice[0] + roll.dice[1] + rolledPower : 0;

	return (
		<div className="shrink-0 border-t border-edge bg-chrome">
			<div className="flex items-stretch gap-3 px-5 pt-4 pb-4">
				<Button
					type="button"
					disabled={open && roll.state === "rolling"}
					onClick={start}
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
				cancelLabel="Close"
			>
				{roll.state === "failed" ? (
					<>
						<p className="font-sans text-sm text-dim">
							{roll.error} Roll on Discord instead:
						</p>
						<div className="flex items-stretch rounded-sm border border-border bg-bg">
							<p className="min-w-0 flex-1 self-center truncate px-3 py-3 font-mono text-sm text-text">
								{rollCommand(rolledPower)}
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
							<p className="font-sans text-xs text-positive">Copied.</p>
						)}
					</>
				) : (
					<>
						<div aria-hidden className="flex items-center gap-3">
							{faces.map((face, index) => (
								<span
									// biome-ignore lint/suspicious/noArrayIndexKey: always two dice, fixed order
									key={index}
									className={`flex size-16 items-center justify-center rounded-md border border-border bg-bg font-display text-[36px] font-bold text-text ${roll.state === "rolling" ? "opacity-60" : ""}`}
								>
									{face}
								</span>
							))}
							<span className="font-display text-[28px] font-bold text-noise">
								{signed(rolledPower)}
							</span>
						</div>
						<p role="status" className="flex flex-col gap-1">
							{roll.state === "rolling" ? (
								<span className="font-sans text-sm text-dim">Rolling…</span>
							) : (
								<>
									<span
										className={`font-display text-[28px] font-bold ${OUTCOME_CLASS[outcome(score)]}`}
									>
										{score} · {outcome(score)}
									</span>
									<span className="sr-only">
										Dice {roll.dice[0]} and {roll.dice[1]}, power{" "}
										{signed(rolledPower)}.
									</span>
									<span className="font-sans text-xs text-dim">
										{roll.posted
											? "Posted to Discord."
											: "Not posted to Discord. Tell the table your result."}
									</span>
								</>
							)}
						</p>
					</>
				)}
				{canMitigate && roll.state !== "rolling" && (
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
