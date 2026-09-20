"use client";

import { Toggle } from "@base-ui/react/toggle";
import { BroadIcon } from "@/app/character/[id]/_components/icons";

const ICON_BUTTON =
	"grid size-11 shrink-0 place-items-center text-[var(--hue)] disabled:opacity-40";

export function BroadButton({
	broad,
	onBroadChange,
	named,
}: {
	broad: boolean;
	onBroadChange: (broad: boolean) => void;
	named: string;
}) {
	return (
		<Toggle
			pressed={broad}
			onPressedChange={onBroadChange}
			aria-label={broad ? `Make ${named} narrow` : `Make ${named} broad`}
			className={`${ICON_BUTTON} ${broad ? "bg-[var(--hue)] text-bg" : ""}`}
		>
			<BroadIcon broad={broad} />
		</Toggle>
	);
}
