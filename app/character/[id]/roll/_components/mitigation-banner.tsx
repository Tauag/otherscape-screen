"use client";

import { Button } from "@base-ui/react/button";
import { SMALL_BUTTON } from "@/components/styles";

/** Shown while a mitigation roll is live: `locked` tags paid for the action
 *  being mitigated, so they sit this roll out. */
export function MitigationBanner({
	locked,
	onCancel,
}: {
	locked: number;
	onCancel: () => void;
}) {
	return (
		<div className="flex items-center justify-between gap-3 rounded-[5px] border border-hairline bg-recess px-3 py-2">
			<p className="font-sans text-xs text-dim">
				Mitigating — {locked} tag{locked === 1 ? "" : "s"} from that action
				locked out.
			</p>
			<Button type="button" onClick={onCancel} className={SMALL_BUTTON}>
				Cancel
			</Button>
		</div>
	);
}
