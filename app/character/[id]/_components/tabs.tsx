"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRollSelection } from "@/app/character/[id]/_components/roll-selection";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import {
	signed,
	toRollSelection,
} from "@/app/character/[id]/_lib/roll-selection";
import { power } from "@/lib/rules/power";

/**
 * The keys of the bottom bar, in reading order, as segments under
 * /character/[id]. A later ticket adds its screen here in one line. A route
 * that does not exist yet stays out, because a key that 404s is worse than a
 * key that is missing. The roll is not in this list: it is the centre key.
 */
export const TABS: { label: string; segment: string; icon: React.ReactNode }[] =
	[
		{
			label: "Sheet",
			segment: "",
			icon: (
				<>
					<path d="M5 3h11l4 4v14H5z" />
					<path d="M9 9h7M9 13h7M9 17h4" />
				</>
			),
		},
		{
			label: "Play",
			segment: "/play",
			icon: (
				<>
					<rect x="3" y="6" width="18" height="12" rx="2" />
					<path d="M7 10v4M17 10v4M12 9v6" />
				</>
			),
		},
		{
			label: "Loadout",
			segment: "/loadout",
			icon: (
				<>
					<path d="M4 7h16v13H4z" />
					<path d="M9 7V4h6v3" />
					<path d="M4 12h16" />
				</>
			),
		},
	];

const KEY =
	"flex flex-col items-center justify-center gap-[5px] font-display text-[9px] font-semibold tracking-[0.12em] uppercase";

export function TabBar({ id }: { id: string }) {
	const pathname = usePathname();
	const { character } = useCharacter();
	const { pick } = useRollSelection();

	const roll = `/character/${id}/roll`;

	// The roll screen is the centre key opened, so it closes with its own X
	// instead of carrying the bar that leads back to it.
	if (pathname === roll) return null;

	const key = (tab: (typeof TABS)[number]) => {
		const href = `/character/${id}${tab.segment}`;
		const active = pathname === href;
		return (
			<Link
				key={tab.segment}
				href={href}
				aria-current={active ? "page" : undefined}
				className={`${KEY} ${active ? "-mt-px border-t-2 border-primary text-text" : "text-muted"}`}
			>
				<svg
					aria-hidden="true"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.7"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					{tab.icon}
				</svg>
				{tab.label}
			</Link>
		);
	};

	const half = Math.ceil(TABS.length / 2);

	return (
		<nav
			aria-label="Character screens"
			className="grid h-[72px] border-t border-edge bg-chrome"
			style={{
				gridTemplateColumns: `repeat(${TABS.length + 1}, minmax(0, 1fr))`,
			}}
		>
			{TABS.slice(0, half).map(key)}

			<Link
				href={roll}
				aria-label="Build a roll"
				className="flex items-center justify-center"
			>
				<span className="flex size-[54px] flex-col items-center justify-center gap-px rounded-[4px] bg-primary text-bg shadow-[0_0_26px_rgba(255,46,136,0.45)] [clip-path:polygon(0_0,100%_0,100%_78%,78%_100%,0_100%)]">
					<span className="font-display text-[20px] leading-none font-bold">
						{signed(power(toRollSelection(character, pick)).total)}
					</span>
					<span className="font-display text-[8px] font-bold tracking-[0.14em]">
						ROLL
					</span>
				</span>
			</Link>

			{TABS.slice(half).map(key)}
		</nav>
	);
}
