"use client";

import { useState } from "react";
import { LabelAction } from "@/components/label-action";
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
			<LabelAction label={`NPCs · ${campaign.npcs.length}`} onClick={addNpc}>
				+ New NPC
			</LabelAction>

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
