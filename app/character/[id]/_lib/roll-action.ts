"use server";

import { randomInt } from "node:crypto";
import {
	cleanLines,
	type Dice,
	type RollLine,
	requestMessage,
	rollMessage,
} from "@/app/character/[id]/_lib/roll-message";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export type RollResult =
	| { dice: Dice; posted: boolean; error: null }
	| { error: string };

export type RequestResult =
	| { posted: boolean; error: null }
	| { error: string };

type Supabase = Awaited<ReturnType<typeof createClient>>;

/**
 * Validates the client's input and loads the character. Returns the name, the
 * webhook to post to (null when Discord is off for this character), and the
 * cleaned lines.
 */
async function prepare(
	supabase: Supabase,
	characterId: unknown,
	lines: unknown,
): Promise<
	| { error: string }
	| { error: null; name: string; webhook: string | null; lines: RollLine[] }
> {
	const clean = cleanLines(lines);
	if (!clean || typeof characterId !== "string")
		return { error: "That roll is not valid." };

	const { data: auth } = await supabase.auth.getClaims();
	if (!auth?.claims) return { error: "Sign in to roll." };

	// RLS returns the row only to a caller who may open this character.
	const { data: row } = await supabase
		.from("characters")
		.select("name, discord_enabled")
		.eq("id", characterId)
		.maybeSingle()
		.overrideTypes<
			{ name: string | null; discord_enabled: boolean },
			{ merge: false }
		>();
	if (!row) return { error: "Could not find that character." };

	let webhook: string | null = null;
	if (row.discord_enabled) {
		// RLS above proved access; the service role may read the campaign.
		const { data: campaignWebhook, error } = await createServiceClient().rpc(
			"character_discord_webhook",
			{ p_character_id: characterId },
		);
		if (error) return { error: "Could not find the Discord channel." };
		webhook = campaignWebhook as string | null;
	}
	return { error: null, name: row.name ?? "", webhook, lines: clean };
}

async function postToDiscord(webhook: string, body: unknown): Promise<boolean> {
	try {
		const response = await fetch(webhook, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(body),
			signal: AbortSignal.timeout(5000),
		});
		return response.ok;
	} catch {
		// Discord down or slow: the roll stands, the player tells the table.
		return false;
	}
}

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
	const prepared = await prepare(await createClient(), characterId, lines);
	if (prepared.error !== null) return { error: prepared.error };

	const dice: Dice = [randomInt(1, 7), randomInt(1, 7)];
	const posted =
		prepared.webhook !== null &&
		(await postToDiscord(
			prepared.webhook,
			rollMessage(prepared.name, prepared.lines, dice, mitigation === true),
		));

	return { dice, posted, error: null };
}

/**
 * Posts the tags the player wants to roll with, with no dice, so the GM can
 * OK the roll aloud first.
 */
export async function requestRoll(
	characterId: string,
	lines: unknown,
	mitigation: boolean,
): Promise<RequestResult> {
	const prepared = await prepare(await createClient(), characterId, lines);
	if (prepared.error !== null) return { error: prepared.error };

	const posted =
		prepared.webhook !== null &&
		(await postToDiscord(
			prepared.webhook,
			requestMessage(prepared.name, prepared.lines, mitigation === true),
		));
	return { posted, error: null };
}
