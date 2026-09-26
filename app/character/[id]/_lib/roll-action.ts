"use server";

import { randomInt } from "node:crypto";
import {
	cleanLines,
	type Dice,
	rollMessage,
} from "@/app/character/[id]/_lib/roll-message";
import { createClient } from "@/lib/supabase/server";

export type RollResult =
	| { dice: Dice; posted: boolean; error: null }
	| { error: string };

/**
 * Rolls 2d6 on the server, so the result is not the client's to choose, and
 * announces it in the table's Discord channel. `posted` is false when there is
 * no webhook or Discord refused it: the roll still stands.
 */
export async function rollDice(
	characterId: string,
	lines: unknown,
	mitigation: boolean,
): Promise<RollResult> {
	const clean = cleanLines(lines);
	if (!clean || typeof characterId !== "string")
		return { error: "That roll is not valid." };

	const supabase = await createClient();
	const { data: auth } = await supabase.auth.getClaims();
	if (!auth?.claims) return { error: "Sign in to roll." };

	// RLS returns the row only to a caller who may open this character.
	const { data: row } = await supabase
		.from("characters")
		.select("name")
		.eq("id", characterId)
		.maybeSingle()
		.overrideTypes<{ name: string | null }, { merge: false }>();
	if (!row) return { error: "Could not find that character." };

	const dice: Dice = [randomInt(1, 7), randomInt(1, 7)];

	let posted = false;
	const webhook = process.env.DISCORD_WEBHOOK_URL;
	if (webhook) {
		try {
			const response = await fetch(webhook, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(
					rollMessage(row.name ?? "", clean, dice, mitigation === true),
				),
				signal: AbortSignal.timeout(5000),
			});
			posted = response.ok;
		} catch {
			// Discord down or slow: the roll stands, the player tells the table.
		}
	}

	return { dice, posted, error: null };
}
