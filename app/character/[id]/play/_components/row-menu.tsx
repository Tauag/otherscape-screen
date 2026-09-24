"use client";

import { Menu } from "@base-ui/react/menu";
import { MoreIcon } from "@/app/character/[id]/_components/icons";
import { MENU_POPUP } from "@/components/styles";

/**
 * The overflow menu a play row carries: the dots trigger and the popup around
 * it. The row supplies the items, each one a `Menu.Item` styled `MENU_ITEM`.
 * The trigger keeps its 44px target without stretching the row it sits in.
 */
export function RowMenu({
	label,
	className = "",
	children,
}: {
	label: string;
	className?: string;
	children: React.ReactNode;
}) {
	return (
		<Menu.Root>
			<Menu.Trigger
				aria-label={label}
				className={`-my-3 -mr-1 flex size-11 shrink-0 items-center justify-center text-dim ${className}`}
			>
				<MoreIcon />
			</Menu.Trigger>

			<Menu.Portal>
				<Menu.Positioner
					side="bottom"
					align="end"
					sideOffset={8}
					className="outline-none"
				>
					<Menu.Popup className={MENU_POPUP}>{children}</Menu.Popup>
				</Menu.Positioner>
			</Menu.Portal>
		</Menu.Root>
	);
}
