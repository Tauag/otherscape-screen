"use client";

import { Button } from "@base-ui/react/button";
import { useActionState } from "react";
import { removeCharacter } from "@/app/admin/campaigns/_lib/actions";

/** The row's remove button, as a client component so a failed remove shows
 *  its error instead of failing silently (campaign-row.tsx's pattern). */
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
		<form action={remove} className="flex flex-col items-end">
			<input type="hidden" name="campaignId" value={campaignId} />
			<input type="hidden" name="characterId" value={characterId} />
			<Button
				type="submit"
				aria-label={`Remove ${name} from campaign`}
				className="flex size-11 shrink-0 items-center justify-center text-dim"
			>
				<svg
					aria-hidden="true"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
				>
					<path d="M18 6 6 18M6 6l12 12" />
				</svg>
			</Button>

			{error && (
				<p role="status" className="font-sans text-[11px] text-negative-text">
					{error}
				</p>
			)}
		</form>
	);
}
