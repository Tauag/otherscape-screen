"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SAVE_STATUS_MESSAGE } from "@/app/character/[id]/_components/layout/character-provider";
import { SheetMenu } from "@/app/character/[id]/_components/layout/menu";
import { NameField } from "@/app/character/[id]/_components/layout/name-field";
import { TABS } from "@/app/character/[id]/_components/layout/tabs";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { backTarget } from "@/app/character/[id]/_lib/back-target";
import { BackIcon } from "@/components/icons";
import { OtherscapeIcon } from "@/components/otherscape-icon";

const BACK = "grid size-9 shrink-0 place-items-center text-dim";

// The board takes over the sheet and play tabs, and its dock builds the roll.
const NAV = TABS.filter((tab) => tab.segment !== "/play");

/** The board's app bar: the phone's `AppBar` plus `TabBar` folded into one
 *  strip. Every character route renders it, so a screen the board's panels do
 *  not cover (evolution, reference, a theme) still has navigation. */
export function BoardBar({
	id,
	shareToken,
}: {
	id: string;
	shareToken: string | null;
}) {
	const { character, status } = useCharacter();
	const pathname = usePathname();

	return (
		<header className="hidden h-[62px] shrink-0 items-center gap-3.5 border-b border-edge bg-chrome px-5 lg:flex">
			<Link
				href={backTarget(pathname, id)}
				aria-label={pathname === `/character/${id}` ? "All characters" : "Back"}
				className={BACK}
			>
				<BackIcon />
			</Link>

			<Link href="/" aria-label="Home" className={BACK}>
				<OtherscapeIcon themes={character.themes} />
			</Link>

			<div className="flex min-w-0 flex-col gap-0.5">
				<NameField className="-my-2 py-2" />
				{character.essence && (
					<span className="font-display text-[10px] font-semibold tracking-[0.18em] text-dim uppercase">
						{character.essence}
					</span>
				)}
			</div>

			<div className="flex-1" />

			<nav aria-label="Character screens" className="flex items-center gap-1">
				{NAV.map((tab) => {
					const href = `/character/${id}${tab.segment}`;
					const active = pathname === href;
					return (
						<Link
							key={href}
							href={href}
							aria-current={active ? "page" : undefined}
							className={`flex h-11 items-center border-b-2 px-3 font-display text-[11px] font-semibold tracking-[0.12em] uppercase ${
								active
									? "border-primary text-text"
									: "border-transparent text-muted"
							}`}
						>
							{tab.segment === "" ? "Board" : tab.label}
						</Link>
					);
				})}
			</nav>

			<p
				role="status"
				aria-live="polite"
				className="ml-4 font-mono text-[11px] tracking-[0.08em] text-faint"
			>
				{SAVE_STATUS_MESSAGE[status]}
			</p>

			<SheetMenu shareToken={shareToken} id={id} />
		</header>
	);
}
