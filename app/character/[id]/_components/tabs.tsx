"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	TabEvolutionIcon,
	TabPlayIcon,
	TabReferenceIcon,
	TabSheetIcon,
} from "@/app/character/[id]/_components/icons";
import { useRollSelection } from "@/app/character/[id]/_components/roll-selection";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import {
	signed,
	toRollSelection,
} from "@/app/character/[id]/_lib/roll-selection";
import { power } from "@/lib/rules/power";

export const TABS: { label: string; segment: string; icon: React.ReactNode }[] =
	[
		{
			label: "Sheet",
			segment: "",
			icon: <TabSheetIcon />,
		},
		{
			label: "Play",
			segment: "/play",
			icon: <TabPlayIcon />,
		},
		{
			label: "Evolution",
			segment: "/evolution",
			icon: <TabEvolutionIcon />,
		},
		{
			label: "Ref",
			segment: "/reference",
			icon: <TabReferenceIcon />,
		},
	];

const KEY =
	"flex flex-col items-center justify-center gap-[5px] font-display text-[9px] font-semibold tracking-[0.12em] uppercase";

export function TabBar({ id }: { id: string }) {
	const pathname = usePathname();
	const { character } = useCharacter();
	const { pick } = useRollSelection();

	const roll = `/character/${id}/roll`;

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
