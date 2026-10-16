"use client";

import { Button } from "@base-ui/react/button";
import { Menu } from "@base-ui/react/menu";
import { useActionState } from "react";
import { setCharacterDiscord } from "@/app/admin/campaigns/_lib/actions";
import { MENU_ITEM } from "@/components/styles";

/** Row menu item that flips whether the character's rolls post to Discord. */
export function DiscordRollsForm({
	campaignId,
	characterId,
	name,
	enabled,
}: {
	campaignId: string;
	characterId: string;
	name: string;
	enabled: boolean;
}) {
	const [error, toggle] = useActionState(setCharacterDiscord, null);

	return (
		<>
			<form action={toggle}>
				<input type="hidden" name="campaignId" value={campaignId} />
				<input type="hidden" name="characterId" value={characterId} />
				<input type="hidden" name="enabled" value={String(!enabled)} />
				<Menu.Item
					nativeButton
					className={MENU_ITEM}
					render={
						<Button
							className="w-full"
							type="submit"
							aria-label={`${enabled ? "Disable" : "Enable"} Discord rolls for ${name}`}
						/>
					}
				>
					{enabled ? "Disable Discord rolls" : "Enable Discord rolls"}
				</Menu.Item>
			</form>

			{error && (
				<p
					role="status"
					className="px-3 py-1 font-sans text-[11px] text-negative-text"
				>
					{error}
				</p>
			)}
		</>
	);
}
