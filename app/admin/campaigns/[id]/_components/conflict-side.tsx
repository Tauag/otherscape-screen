import { Button } from "@base-ui/react/button";
import type { Campaign } from "@/app/admin/campaigns/_lib/types";

type Props = {
	label: string;
	document: Campaign;
	at: string;
	action: string;
	onKeep: () => void;
};

/** Campaign's version of app/character/[id]/_components/layout/conflict-side.tsx's
 *  Side: same shell, typed to Campaign instead of Character. Campaign-only
 *  (one subtree), so it stays here rather than in components/. */
export function Side({ label, document: value, at, action, onKeep }: Props) {
	const json = JSON.stringify(value, null, 2);

	return (
		<section className="rounded-sm border border-border p-3">
			<p className="font-mono text-[10px] tracking-[0.08em] text-faint uppercase">
				{label}
			</p>
			<p className="font-display text-lg font-bold tracking-[0.05em] uppercase">
				{value.name.trim() || "Unnamed"}
			</p>
			<p className="font-sans text-[11.5px] text-dim">
				Edited <time dateTime={at}>{new Date(at).toLocaleString()}</time>
			</p>

			<details className="mt-2">
				<summary className="min-h-11 cursor-pointer content-center font-mono text-[10px] tracking-[0.08em] text-dim uppercase">
					Read it
				</summary>
				<pre className="mt-1 max-h-48 overflow-auto rounded-sm bg-bg p-2 font-mono text-[10px] text-dim">
					{json}
				</pre>
			</details>

			<div className="mt-2 flex items-center gap-2">
				<Button
					type="button"
					onClick={onKeep}
					className="inline-flex min-h-11 items-center rounded-sm bg-primary px-4 font-display text-sm font-bold tracking-[0.08em] text-bg uppercase"
				>
					{action}
				</Button>
				<Button
					type="button"
					onClick={() => void navigator.clipboard?.writeText(json)}
					className="inline-flex min-h-11 items-center rounded-sm border border-border px-4 font-display text-sm font-semibold tracking-[0.08em] uppercase"
				>
					Copy
				</Button>
			</div>
		</section>
	);
}
