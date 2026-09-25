"use client";

import { Button } from "@base-ui/react/button";
import { useState } from "react";
import { LABEL } from "@/components/styles";
import { useCampaign } from "../_hooks/use-campaign";
import { NpcCard } from "./npc-card";

/** The main column's NPCs section: design.md 8.2, canvas Campaign screen. */
export function NpcSection() {
	const { campaign, dispatch } = useCampaign();
	/** The card that opens focused on its name: the one this screen just added. */
	const [added, setAdded] = useState<string | null>(null);

	function addNpc() {
		const id = crypto.randomUUID();
		dispatch({ type: "addNpc", id });
		setAdded(id);
	}

	return (
		<div className="flex min-h-0 flex-col gap-3 lg:flex-1">
			<div className="flex items-center justify-between gap-2">
				<span className={LABEL}>NPCs · {campaign.npcs.length}</span>
				<Button
					type="button"
					onClick={addNpc}
					className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-sm bg-primary px-4 font-display text-sm font-bold tracking-[0.08em] text-bg uppercase"
				>
					<span aria-hidden="true" className="text-base leading-none">
						+
					</span>
					New NPC
				</Button>
			</div>

			{campaign.npcs.length === 0 ? (
				<p className="font-sans text-sm text-dim">No NPCs yet.</p>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:min-h-0 lg:flex-1 lg:auto-rows-min lg:overflow-y-auto lg:pr-1">
					{campaign.npcs.map((npc) => (
						<NpcCard key={npc.id} npc={npc} autoFocus={npc.id === added} />
					))}
				</div>
			)}
		</div>
	);
}
