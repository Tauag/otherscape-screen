"use client";

import { Tooltip } from "@base-ui/react/tooltip";

/** Wraps a special's name with its rule text as a hover tooltip, so the rule
 *  reads without opening the edit card. No-op when there's no rule text. */
export function SpecialTooltip({
	text,
	children,
}: {
	text: string;
	children: React.ReactNode;
}) {
	if (!text) return <>{children}</>;

	return (
		<Tooltip.Root>
			<Tooltip.Trigger render={<span />} className="cursor-help">
				{children}
			</Tooltip.Trigger>
			<Tooltip.Portal>
				<Tooltip.Positioner
					side="top"
					sideOffset={6}
					className="max-w-[280px] outline-none"
				>
					<Tooltip.Popup className="rounded-md border border-border bg-surface px-2.5 py-1.5 font-sans text-[14px] text-text shadow-lg">
						{text}
					</Tooltip.Popup>
				</Tooltip.Positioner>
			</Tooltip.Portal>
		</Tooltip.Root>
	);
}
