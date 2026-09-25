"use client";

import { Button } from "@base-ui/react/button";
import { PRIMARY } from "@/app/character/[id]/_components/styles";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { QUIET } from "@/components/styles";
import { DEFAULT_BURN_VALUE } from "@/lib/rules/constants";

/** The Power a burn is worth: the default, or the 4 and 5 a theme special buys. */
const CHOICES = [DEFAULT_BURN_VALUE, 4, 5];

/**
 * Sets what a burnt tag is worth in this roll. The value belongs to the roll
 * and never to the character document: the sheet's own burn toggle (T26) keeps
 * using the default.
 */
export function BurnOverride({
	named,
	value,
	open,
	onOpenChange,
	onChoose,
}: {
	named: string;
	value: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onChoose: (value: number) => void;
}) {
	return (
		<ConfirmDialog
			open={open}
			onOpenChange={onOpenChange}
			title="Burn value"
			description={`What ${named} burns for in this roll. A theme special raises it to 4 or 5. The sheet keeps ${DEFAULT_BURN_VALUE}.`}
		>
			{CHOICES.map((choice) => (
				<Button
					key={choice}
					type="button"
					onClick={() => onChoose(choice)}
					aria-pressed={choice === value}
					className={choice === value ? PRIMARY : QUIET}
				>
					{choice} Power
				</Button>
			))}
		</ConfirmDialog>
	);
}
