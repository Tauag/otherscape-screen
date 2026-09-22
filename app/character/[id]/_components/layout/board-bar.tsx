"use client";

import { Input } from "@base-ui/react/input";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BackIcon } from "@/app/character/[id]/_components/icons";
import { SAVE_STATUS_MESSAGE } from "@/app/character/[id]/_components/layout/character-provider";
import { SheetMenu } from "@/app/character/[id]/_components/layout/menu";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";

const BACK = "grid size-9 shrink-0 place-items-center text-dim";

const NAV = (id: string) => [
	{ label: "Board", href: `/character/${id}` },
	{ label: "Evolution", href: `/character/${id}/evolution` },
	{ label: "Ref", href: `/character/${id}/reference` },
];

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
	const { character, dispatch, status } = useCharacter();
	const pathname = usePathname();
	const router = useRouter();

	return (
		<header className="hidden h-[62px] shrink-0 items-center gap-3.5 border-b border-edge bg-chrome px-5 lg:flex">
			{/* Nothing sits above the board but the roster, so the arrow points
			    there rather than into history, which a deep link leaves empty. */}
			{pathname === `/character/${id}` ? (
				<Link href="/" aria-label="All characters" className={BACK}>
					<BackIcon />
				</Link>
			) : (
				<button
					type="button"
					onClick={() => router.back()}
					aria-label="Back"
					className={BACK}
				>
					<BackIcon />
				</button>
			)}

			<div className="flex min-w-0 flex-col gap-0.5">
				{/* biome-ignore lint/a11y/noLabelWithoutControl: Base UI's Input renders a real <input> inside this label. */}
				<label className="-my-2 flex items-center py-2">
					<span className="sr-only">Name</span>
					<Input
						value={character.name}
						autoComplete="off"
						onChange={(event) =>
							dispatch({ type: "rename", name: event.target.value })
						}
						placeholder="Unnamed"
						className="min-w-0 bg-transparent font-display text-[17px] leading-none font-bold tracking-[0.05em] text-text uppercase placeholder:text-dim"
					/>
				</label>
				{character.essence && (
					<span className="font-display text-[10px] font-semibold tracking-[0.18em] text-dim uppercase">
						{character.essence}
					</span>
				)}
			</div>

			<div className="flex-1" />

			<nav aria-label="Character screens" className="flex items-center gap-1">
				{NAV(id).map((item) => {
					const active = pathname === item.href;
					return (
						<Link
							key={item.href}
							href={item.href}
							aria-current={active ? "page" : undefined}
							className={`flex h-11 items-center border-b-2 px-3 font-display text-[11px] font-semibold tracking-[0.12em] uppercase ${
								active
									? "border-primary text-text"
									: "border-transparent text-muted"
							}`}
						>
							{item.label}
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
