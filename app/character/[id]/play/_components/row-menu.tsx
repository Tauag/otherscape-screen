"use client";

import { Menu } from "@base-ui/react/menu";
import { MENU_POPUP } from "@/app/character/[id]/_components/styles";

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
				<svg
					aria-hidden="true"
					width="4"
					height="18"
					viewBox="0 0 4 18"
					fill="currentColor"
				>
					<circle cx="2" cy="2" r="2" />
					<circle cx="2" cy="9" r="2" />
					<circle cx="2" cy="16" r="2" />
				</svg>
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
