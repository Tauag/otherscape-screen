"use client";

import { Dialog } from "@base-ui/react/dialog";
import type { ReactNode } from "react";
import { DIALOG_BACKDROP, DIALOG_POPUP, HEADING, QUIET } from "./styles";

/**
 * The shell every dialog in the app shares: backdrop, popup sized to
 * `DIALOG_POPUP` (never full-screen), a title, an optional description
 * line, and a body. `cancelLabel` appends a `Dialog.Close` after the body,
 * in the same column; pass `null` when the body supplies its own close
 * action (a form's own Cancel button, or a dialog with no way out).
 */
export function ConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	cancelLabel = "Cancel",
	popupClassName,
	children,
}: {
	open: boolean;
	onOpenChange: Dialog.Root.Props["onOpenChange"];
	title: ReactNode;
	description?: ReactNode;
	cancelLabel?: string | null;
	/** Extra classes for the popup, e.g. a scroll cap for long content. */
	popupClassName?: string;
	children?: ReactNode;
}) {
	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Backdrop className={DIALOG_BACKDROP} />
				<Dialog.Popup
					className={
						popupClassName ? `${DIALOG_POPUP} ${popupClassName}` : DIALOG_POPUP
					}
				>
					<Dialog.Title className={HEADING}>{title}</Dialog.Title>
					{description && (
						<p className="mt-2 font-sans text-sm text-dim">{description}</p>
					)}
					{(children || cancelLabel) && (
						<div className="mt-4 flex flex-col gap-3">
							{children}
							{cancelLabel && (
								<Dialog.Close className={`${QUIET} self-start`}>
									{cancelLabel}
								</Dialog.Close>
							)}
						</div>
					)}
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
