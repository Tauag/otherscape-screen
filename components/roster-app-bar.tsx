"use client";

import { Menu } from "@base-ui/react/menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BackIcon, ChevronRightIcon } from "@/components/icons";
import { OtherscapeIcon } from "@/components/otherscape-icon";
import { MENU_ITEM, MENU_POPUP } from "@/components/styles";
import { signOut } from "@/lib/actions";

function backTarget(pathname: string): string | null {
	if (pathname === "/") return null;
	if (pathname === "/admin/users") return "/";
	if (pathname === "/admin/campaigns") return "/";
	if (pathname.startsWith("/admin/campaigns/")) return "/admin/campaigns";
	return "/admin/users";
}

export function RosterAppBar({
	title,
	accountName,
	isAdmin,
	status,
}: {
	title: string;
	accountName: string;
	isAdmin: boolean;
	status?: React.ReactNode;
}) {
	const pathname = usePathname();
	const back = backTarget(pathname);

	return (
		<header className="flex items-center justify-between gap-3 px-5 pt-6 pb-4">
			<div className="flex items-center gap-1">
				{back && (
					<Link
						href={back}
						aria-label="Back"
						className="-m-1 -ml-2 flex size-11 shrink-0 items-center justify-center p-1 text-dim"
					>
						<BackIcon />
					</Link>
				)}

				<Link
					href="/"
					aria-label="Home"
					className="-m-1 -ml-2 flex size-11 shrink-0 items-center justify-center p-1 text-dim"
				>
					<OtherscapeIcon />
				</Link>

				<h1 className="font-display text-[19px] font-bold tracking-[0.16em] uppercase">
					{title}
				</h1>
			</div>

			<div className="flex items-center gap-4">
				{status}

				<Menu.Root>
					<Menu.Trigger
						aria-label="Account menu"
						className="flex min-h-11 items-center gap-2 rounded-[20px] border border-border py-1 pr-3 pl-1.5"
					>
						<span
							aria-hidden="true"
							className="grid size-[22px] place-items-center rounded-full bg-border font-display text-[11px] font-bold text-text"
						>
							{accountName.trim().charAt(0).toUpperCase()}
						</span>
						<span className="font-sans text-xs text-dim">{accountName}</span>
					</Menu.Trigger>

					<Menu.Portal>
						<Menu.Positioner
							side="bottom"
							align="end"
							sideOffset={8}
							className="outline-none"
						>
							<Menu.Popup className={MENU_POPUP}>
								{isAdmin && (
									<Menu.Item
										className={MENU_ITEM}
										render={<Link href="/admin/users" />}
									>
										Users
									</Menu.Item>
								)}
								{isAdmin && (
									<Menu.Item
										className={MENU_ITEM}
										render={<Link href="/admin/campaigns" />}
									>
										Campaigns
									</Menu.Item>
								)}
								<Menu.Item className={MENU_ITEM} onClick={() => void signOut()}>
									Log out
									<ChevronRightIcon className="size-3.5 text-faint ml-2" />
								</Menu.Item>
							</Menu.Popup>
						</Menu.Positioner>
					</Menu.Portal>
				</Menu.Root>
			</div>
		</header>
	);
}
