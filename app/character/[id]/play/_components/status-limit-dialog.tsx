"use client";

import { Button } from "@base-ui/react/button";
import { Input } from "@base-ui/react/input";
import { useId, useState } from "react";
import { ConfirmDialog } from "@/app/character/[id]/_components/confirm-dialog";
import { PRIMARY } from "@/app/character/[id]/_components/styles";

/**
 * Raises or lowers a status's tier limit. Hidden behind the row menu: the
 * typical limit is 6, and only a rare, larger status needs anything else.
 */
export function StatusLimitDialog({
	named,
	limit,
	open,
	onOpenChange,
	onChoose,
}: {
	named: string;
	limit: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onChoose: (limit: number) => void;
}) {
	const [value, setValue] = useState(String(limit));
	const inputId = useId();
	const parsed = Number.parseInt(value, 10);
	const valid = Number.isInteger(parsed) && parsed >= 1;

	return (
		<ConfirmDialog
			open={open}
			onOpenChange={(next) => {
				if (next) setValue(String(limit));
				onOpenChange(next);
			}}
			title="Tier limit"
			description={`The highest tier ${named} can reach. Most statuses stay at 6; raise this only for the rare status built larger.`}
		>
			<label htmlFor={inputId} className="sr-only">
				Tier limit
			</label>
			<Input
				id={inputId}
				type="number"
				autoComplete="off"
				min={1}
				value={value}
				onChange={(event) => setValue(event.target.value)}
				className="min-h-11 rounded-sm border border-border bg-bg px-3 font-display text-[15px] text-text"
			/>
			<Button
				type="button"
				disabled={!valid}
				onClick={() => onChoose(parsed)}
				className={`${PRIMARY} justify-center disabled:opacity-40`}
			>
				Set limit
			</Button>
		</ConfirmDialog>
	);
}
