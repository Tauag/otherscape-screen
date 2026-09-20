"use client";

import { Accordion } from "@base-ui/react/accordion";
import { Button } from "@base-ui/react/button";

const BOX =
	"grid size-6 shrink-0 place-items-center rounded-xs border font-bold";
const CHECKED = "border-primary bg-primary text-bg";
const UNCHECKED = "border-pip text-transparent";

const SLOT =
	"rounded-sm border border-dashed border-pip font-mono text-[10px] tracking-[0.08em] text-faint uppercase";

/** The accordion shell every Moment row shares: an indicator, the name, and
 *  the rule text below, collapsed by default - same shape as a theme's
 *  SpecialCard. `indicator` is what marks progress: a checkbox for a
 *  once-only Moment, a 3-box track for Gain a Veteran Special. */
function MomentShell({
	name,
	text,
	indicator,
}: {
	name: string;
	text: string;
	indicator: React.ReactNode;
}) {
	return (
		<Accordion.Item
			render={<li />}
			className="rounded-sm border border-border bg-surface data-[open]:border-primary"
		>
			<div className="flex items-center gap-2.5 px-3 py-2">
				{indicator}

				<Accordion.Header className="min-w-0 flex-1">
					<Accordion.Trigger className="group flex min-h-11 w-full items-center justify-between gap-2 text-left font-display text-sm font-semibold tracking-[0.03em] uppercase">
						{name}
						<span
							aria-hidden
							className="shrink-0 text-faint transition-transform group-data-[panel-open]:rotate-180"
						>
							▾
						</span>
					</Accordion.Trigger>
				</Accordion.Header>
			</div>

			<Accordion.Panel className="px-3 pb-2.5 pl-[46px] font-sans text-[13px] text-dim">
				{text === "" ? (
					<p className={`${SLOT} min-h-11 content-center px-3 py-2`}>
						rule slot
					</p>
				) : (
					text
				)}
			</Accordion.Panel>
		</Accordion.Item>
	);
}

/**
 * A Moment taken once: a checkbox the player owns. The app never checks or
 * clears it on its own.
 */
export function MomentRow({
	name,
	text,
	checked,
	onCheckedChange,
}: {
	name: string;
	text: string;
	checked: boolean;
	onCheckedChange: () => void;
}) {
	return (
		<MomentShell
			name={name}
			text={text}
			indicator={
				<Button
					type="button"
					onClick={onCheckedChange}
					aria-pressed={checked}
					aria-label={checked ? `Clear ${name}` : `Take ${name}`}
					className={`${BOX} ${checked ? CHECKED : UNCHECKED}`}
				>
					✓
				</Button>
			}
		/>
	);
}

/** Gain a Veteran Special: the one Moment takeable up to 3 times, so a single
 *  box can't hold it. `marked` and `onMark` follow TrackPips' own cycling
 *  convention: one click marks the next box, wrapping back to empty at 3. */
export function CountedMomentRow({
	name,
	text,
	marked,
	onMark,
}: {
	name: string;
	text: string;
	marked: number;
	onMark: () => void;
}) {
	return (
		<MomentShell
			name={name}
			text={text}
			indicator={
				<Button
					type="button"
					onClick={onMark}
					aria-label={`${name}, ${marked} of 3 taken. Click to mark one.`}
					className="flex shrink-0 gap-[3px]"
				>
					{[0, 1, 2].map((index) => (
						<span
							key={index}
							aria-hidden="true"
							className={`size-[12px] ${
								index < marked ? "bg-primary" : "border border-pip"
							}`}
						/>
					))}
				</Button>
			}
		/>
	);
}
