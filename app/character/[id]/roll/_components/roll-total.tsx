"use client";

import { Button } from "@base-ui/react/button";
import { signed } from "@/app/character/[id]/_lib/roll-selection";
import { LABEL } from "@/components/styles";

export function RollTotal({
	total,
	modifier,
}: {
	total: number;
	modifier: number;
}) {
	return (
		<div className="shrink-0 border-t border-edge bg-chrome">
			<div className="flex items-stretch gap-3 px-5 pt-4 pb-4">
				<Button
					type="button"
					disabled
					focusableWhenDisabled
					aria-disabled="true"
					className="flex flex-1 flex-col items-center justify-center rounded-[5px] bg-primary/45 font-display text-[19px] font-bold tracking-[0.1em] text-bg uppercase [clip-path:polygon(0_0,100%_0,100%_74%,92%_100%,0_100%)]"
				>
					Roll 2d6
				</Button>

				<p className="flex flex-col items-end justify-center">
					<span className={LABEL}>Power</span>
					<span className="font-display text-[44px] leading-[0.95] font-bold text-noise [text-shadow:0_0_26px_color-mix(in_oklab,var(--color-noise)_50%,transparent)]">
						{signed(total)}
					</span>
					<span className="font-mono text-[11px] text-dim">
						mod {signed(modifier)}
					</span>
				</p>
			</div>
		</div>
	);
}
