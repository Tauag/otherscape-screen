"use client";

import { Toggle } from "@base-ui/react/toggle";

const ICON_BUTTON =
	"grid size-11 shrink-0 place-items-center rounded-sm border border-border text-[var(--hue)] disabled:opacity-40";

function FlameIcon({ burnt }: { burnt: boolean }) {
	return (
		<svg
			aria-hidden="true"
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill={burnt ? "currentColor" : "none"}
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4" />
		</svg>
	);
}

/** A plain burn/un-burn toggle. The caller owns what burning means for its tag. */
export function BurnButton({
	burnt,
	onBurntChange,
	named,
	disabled,
}: {
	burnt: boolean;
	onBurntChange: (burnt: boolean) => void;
	named: string;
	disabled?: boolean;
}) {
	return (
		<Toggle
			pressed={burnt}
			onPressedChange={onBurntChange}
			disabled={disabled}
			aria-label={burnt ? `Un-burn ${named}` : `Burn ${named}`}
			className={ICON_BUTTON}
		>
			<FlameIcon burnt={burnt} />
		</Toggle>
	);
}
