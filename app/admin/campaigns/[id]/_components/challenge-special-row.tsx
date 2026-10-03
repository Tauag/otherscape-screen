"use client";

import { Menu } from "@base-ui/react/menu";
import type { Special } from "@/app/admin/campaigns/_lib/types";
import { RowMenu } from "@/components/row-menu";
import { MENU_ITEM } from "@/components/styles";
import { useCampaign } from "../_hooks/use-campaign";

/** One special: free text that grows with what's written, so a few sentences
 *  never scroll inside a small box. */
export function ChallengeSpecialRow({
	challengeId,
	special,
	autoFocus,
}: {
	challengeId: string;
	special: Special;
	autoFocus: boolean;
}) {
	const { dispatch } = useCampaign();

	return (
		<li className="flex items-center rounded-sm border border-border bg-bg has-[textarea:focus-visible]:outline-2 has-[textarea:focus-visible]:outline-auto">
			<textarea
				value={special.text}
				// biome-ignore lint/a11y/noAutofocus: only the special that "+ Special" just added takes focus.
				autoFocus={autoFocus}
				onChange={(event) =>
					dispatch({
						type: "setChallengeSpecialText",
						challengeId,
						id: special.id,
						text: event.target.value,
					})
				}
				aria-label="Special"
				placeholder="What this challenge can do that others can't"
				className="field-sizing-content min-h-11 min-w-0 flex-1 resize-none bg-transparent p-2.5 outline-none font-sans text-[13px] text-text placeholder:text-dim"
			/>
			<RowMenu label="Menu for this special">
				<Menu.Item
					className={MENU_ITEM}
					onClick={() =>
						dispatch({
							type: "removeChallengeSpecial",
							challengeId,
							id: special.id,
						})
					}
				>
					Delete
				</Menu.Item>
			</RowMenu>
		</li>
	);
}
