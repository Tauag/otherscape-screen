"use client";

import { Button } from "@base-ui/react/button";
import { signed } from "@/app/character/[id]/_lib/roll-selection";
import { LABEL } from "@/components/styles";
import type { PowerBreakdown } from "@/lib/rules/power";

/**
 * The arithmetic, then the total, then the roll. design.md 4.1: Power is never
 * a bare number, so the lines print above the total the player is about to use.
 */
export function RollTotal({ lines, total }: PowerBreakdown) {
	return (
		<div className="shrink-0 border-t border-edge bg-chrome">
			{lines.length > 0 && (
				<ul className="flex flex-wrap gap-x-2.5 gap-y-1 px-5 pt-2.5 pb-2">
					{lines.map((line, index) => (
						<li
							// A tag's text is its label, and two tags may share it, so the
							// position in the breakdown is the only identity a line has.
							// biome-ignore lint/suspicious/noArrayIndexKey: see above.
							key={index}
							className={`font-mono text-[10px] ${
								line.counted ? "text-dim" : "text-faint line-through"
							}`}
						>
							{line.label.trim() || "Unnamed"} {signed(line.value)}
						</li>
					))}
				</ul>
			)}

			<div className="flex items-stretch gap-3 px-5 pt-1 pb-4">
				<p className="flex flex-col justify-center">
					<span className={LABEL}>Power</span>
					<span className="font-display text-[44px] leading-[0.95] font-bold text-noise [text-shadow:0_0_26px_color-mix(in_oklab,var(--color-noise)_50%,transparent)]">
						{signed(total)}
					</span>
				</p>

				{/* lazy: the dice are T52, which depends on this screen, so the key
				    ships disabled. The upgrade path is T52's roll2d6. */}
				<Button
					type="button"
					disabled
					focusableWhenDisabled
					aria-disabled="true"
					className="flex flex-1 flex-col items-center justify-center rounded-[5px] bg-primary/45 font-display text-[19px] font-bold tracking-[0.1em] text-bg uppercase [clip-path:polygon(0_0,100%_0,100%_74%,92%_100%,0_100%)]"
				>
					Roll 2d6
				</Button>
			</div>
		</div>
	);
}
