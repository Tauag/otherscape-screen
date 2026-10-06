"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { BackIcon, OtherscapeIcon } from "@/components/icons";
import { isNascent } from "@/lib/character/theme";
import { useCharacter } from "../../_hooks/use-character";
import { backTarget } from "../../_lib/back-target";
import { SheetMenu } from "./menu";
import { NameField } from "./name-field";

const BACK =
	"-m-1 flex size-11 shrink-0 items-center justify-center p-1 text-dim";

export function AppBar({ shareToken }: { shareToken: string | null }) {
	const { character } = useCharacter();
	const { id } = useParams<{ id: string }>();
	const pathname = usePathname();

	return (
		<header className="sticky top-0 mx-auto flex w-full max-w-md items-center gap-[11px] border-b border-edge bg-chrome px-4 pt-[max(13px,env(safe-area-inset-top))] pb-[13px] lg:hidden">
			<Link
				href={backTarget(pathname, id)}
				aria-label={pathname === `/character/${id}` ? "All characters" : "Back"}
				className={BACK}
			>
				<BackIcon />
			</Link>

			<Link href="/" aria-label="Home" className={BACK}>
				<OtherscapeIcon />
			</Link>

			<div className="flex min-w-0 flex-1 flex-col gap-[3px]">
				<NameField className="-my-[14px] w-full py-[14px]" />

				{/* Repeats what the theme cards already say, so a screen reader does
            not read it twice. */}
				<div aria-hidden="true" className="flex items-center gap-[7px]">
					<div className="flex gap-0.5">
						{character.themes.map((theme) => (
							<span
								key={theme.id}
								data-type={theme.type}
								style={{ opacity: isNascent(theme) ? 0.28 : 1 }}
								className="h-0.5 w-3 bg-[var(--hue)]"
							/>
						))}
					</div>

					{character.essence && (
						<span className="font-display text-[10px] font-semibold tracking-[0.18em] text-dim uppercase">
							{character.essence}
						</span>
					)}
				</div>
			</div>

			<SheetMenu shareToken={shareToken} id={id} />
		</header>
	);
}
