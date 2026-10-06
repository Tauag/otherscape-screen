"use client";

import { Button } from "@base-ui/react/button";
import type { MouseEvent } from "react";
import type { Status } from "@/lib/character/types";

const BOX = "h-3.5 w-9";
const LIT = `${BOX} bg-[var(--hue)] shadow-[0_0_8px_color-mix(in_oklab,var(--hue)_55%,transparent)]`;
const UNLIT = `${BOX} border border-[var(--hue)]/30`;

/** A status's row of tier boxes. `tier` is 1-based. */
export function TierTrack({
	status,
	label,
	onTier,
}: {
	status: Status;
	label: (tier: number, marked: boolean) => string;
	onTier: (tier: number, marked: boolean, event: MouseEvent) => void;
}) {
	const tier = status.tiers.lastIndexOf(true) + 1;

	return (
		<fieldset
			aria-label={`Tier, ${tier} of ${status.limit} marked`}
			className="m-0 flex flex-wrap gap-1.5 border-0 p-0"
		>
			{status.tiers.map((marked, index) => (
				<Button
					// biome-ignore lint/suspicious/noArrayIndexKey: a fixed-length tier track, position is the identity.
					key={index}
					type="button"
					aria-pressed={marked}
					aria-label={label(index + 1, marked)}
					onClick={(event) => onTier(index + 1, marked, event)}
					className="flex h-9 w-9 items-center justify-center"
				>
					<span aria-hidden className={marked ? LIT : UNLIT} />
				</Button>
			))}
		</fieldset>
	);
}
