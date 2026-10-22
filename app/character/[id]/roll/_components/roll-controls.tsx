"use client";

import { Button } from "@base-ui/react/button";
import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { useId } from "react";
import { useRollSelection } from "@/app/character/[id]/_components/roll-selection";
import { LABEL } from "@/components/styles";
import type { ThemeType } from "@/lib/character/types";

const OPTIONS: { value: ThemeType; label: string }[] = [
	{ value: "self", label: "Self" },
	{ value: "mythos", label: "Mythos" },
	{ value: "noise", label: "Noise" },
];

const STEP =
	"grid size-11 place-items-center border border-border font-display text-[20px] text-quiet";
const SEGMENT =
	"grid min-h-11 cursor-pointer place-items-center border-r border-border px-1 font-display text-[13px] font-semibold tracking-[0.05em] text-dim last:border-r-0 data-pressed:bg-primary/12 data-pressed:text-primary";

/** The manual modifier, and the theme type the roll replaces its tags with. */
export function RollControls() {
	const { pick, setPick } = useRollSelection();
	const label = useId();

	const step = (delta: number) =>
		setPick((current) => ({ ...current, modifier: current.modifier + delta }));

	return (
		<div className="flex flex-col gap-3 rounded-[5px] border border-hairline bg-recess p-3">
			<div className="flex items-center justify-between gap-2.5">
				<div className="flex flex-col gap-0.5">
					<span className="font-display text-[13px] font-semibold tracking-[0.05em] text-burnt uppercase">
						Modifier
					</span>
					<span className="font-sans text-[11px] text-muted">
						Scale gap, MC calls
					</span>
				</div>

				<div className="flex items-center">
					<Button
						type="button"
						onClick={() => step(-1)}
						aria-label="Lower the modifier"
						className={`${STEP} rounded-l-sm`}
					>
						<span aria-hidden>−</span>
					</Button>
					<output className="grid size-11 place-items-center border-y border-border font-mono text-base font-bold text-text">
						{pick.modifier}
					</output>
					<Button
						type="button"
						onClick={() => step(1)}
						aria-label="Raise the modifier"
						className={`${STEP} rounded-r-sm`}
					>
						<span aria-hidden>+</span>
					</Button>
				</div>
			</div>

			<div className="flex flex-col gap-1.5">
				<span id={label} className={LABEL}>
					Rolling with
				</span>
				<ToggleGroup
					multiple
					aria-labelledby={label}
					value={pick.rollWith}
					onValueChange={(value) =>
						setPick((current) => ({
							...current,
							// Fixed order, so the label doesn't depend on tap order.
							rollWith: OPTIONS.map((o) => o.value).filter((v) =>
								value.includes(v),
							),
						}))
					}
					className="grid grid-cols-3 overflow-hidden rounded-sm border border-border"
				>
					{OPTIONS.map((option) => (
						<Toggle key={option.value} value={option.value} className={SEGMENT}>
							{option.label}
						</Toggle>
					))}
				</ToggleGroup>
			</div>
		</div>
	);
}
