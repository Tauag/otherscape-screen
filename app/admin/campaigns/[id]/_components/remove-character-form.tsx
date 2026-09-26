"use client";

import { Button } from "@base-ui/react/button";
import { Menu } from "@base-ui/react/menu";
import { useActionState } from "react";
import { removeCharacter } from "@/app/admin/campaigns/_lib/actions";
import { MENU_ITEM } from "@/components/styles";

/** The row menu's "Delete" item, as a client component so a failed remove
 *  shows its error instead of failing silently (campaign-row.tsx's pattern). */
export function RemoveCharacterForm({
	campaignId,
	characterId,
	name,
}: {
	campaignId: string;
	characterId: string;
	name: string;
}) {
	const [error, remove] = useActionState(removeCharacter, null);

	return (
		<>
			<form action={remove}>
				<input type="hidden" name="campaignId" value={campaignId} />
				<input type="hidden" name="characterId" value={characterId} />
				<Menu.Item
					nativeButton
					className={`${MENU_ITEM} text-danger-text`}
					render={
						<Button
							className="w-full"
							type="submit"
							aria-label={`Remove ${name} from campaign`}
						/>
					}
				>
					Delete
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
