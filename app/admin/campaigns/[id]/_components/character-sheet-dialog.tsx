"use client";

import { Dialog } from "@base-ui/react/dialog";
import type { ReactNode } from "react";
import { ShareSheet } from "@/components/share-sheet";
import { DIALOG_BACKDROP } from "@/components/styles";
import type { Character } from "@/lib/character/types";

/** Opens the read-only character sheet over the campaign roster, so the admin never leaves the page. */
export function CharacterSheetDialog({
	character,
	player,
	children,
}: {
	character: Character;
	player: string;
	children: ReactNode;
}) {
	return (
		<Dialog.Root>
			<Dialog.Trigger className="flex min-w-0 flex-1 items-center gap-2.5 px-2.5 py-2 text-left">
				{children}
			</Dialog.Trigger>

			<Dialog.Portal>
				<Dialog.Backdrop className={DIALOG_BACKDROP} />
				<Dialog.Popup className="fixed inset-0 m-auto flex h-[90vh] w-[92vw] max-w-5xl flex-col overflow-hidden rounded-md border border-border bg-surface text-text">
					<ShareSheet
						character={character}
						subtitle={`Read-only · ${player}'s character`}
						className="flex min-h-0 flex-1 flex-col overflow-y-auto"
					/>
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
