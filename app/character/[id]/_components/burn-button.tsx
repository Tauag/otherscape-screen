"use client";

import { Toggle } from "@base-ui/react/toggle";
import { FlameIcon } from "@/app/character/[id]/_components/icons";

const ICON_BUTTON =
	"grid size-11 shrink-0 place-items-center rounded-sm border border-border text-[var(--hue)] disabled:opacity-40";
const BARE_ICON_BUTTON =
	"grid size-11 shrink-0 place-items-center text-[var(--hue)] disabled:opacity-40";

/** A plain burn/un-burn toggle. The caller owns what burning means for its tag. */
export function BurnButton({
	burnt,
	onBurntChange,
	named,
	disabled,
	bare,
}: {
	burnt: boolean;
	onBurntChange: (burnt: boolean) => void;
	named: string;
	disabled?: boolean;
	/** True inside a merged control group, which already supplies the border. */
	bare?: boolean;
}) {
	return (
		<Toggle
			pressed={burnt}
			onPressedChange={onBurntChange}
			disabled={disabled}
			aria-label={burnt ? `Un-burn ${named}` : `Burn ${named}`}
			className={bare ? BARE_ICON_BUTTON : ICON_BUTTON}
		>
			<FlameIcon burnt={burnt} />
		</Toggle>
	);
}
