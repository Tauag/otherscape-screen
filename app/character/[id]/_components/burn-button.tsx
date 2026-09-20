"use client";

import { Toggle } from "@base-ui/react/toggle";
import { FlameIcon } from "@/app/character/[id]/_components/icons";

const ICON_BUTTON =
	"grid size-11 shrink-0 place-items-center rounded-sm text-[var(--hue)] disabled:opacity-40";

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
