"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { migrate } from "@/lib/character/migrate";
import { newCharacter } from "@/lib/character/new";
import type { Character } from "@/lib/character/types";
import { createClient } from "@/lib/supabase/server";

export async function signInWithGoogle() {
	const origin = process.env.URL ?? (await headers()).get("origin");
	const supabase = await createClient();

	const { data, error } = await supabase.auth.signInWithOAuth({
		provider: "google",
		options: { redirectTo: `${origin}/auth/callback` },
	});

	if (error || !data.url) {
		throw new Error(error?.message ?? "Could not start sign-in");
	}

	redirect(data.url);
}

export async function signInWithDiscord() {
	const origin = process.env.URL ?? (await headers()).get("origin");
	const supabase = await createClient();

	const { data, error } = await supabase.auth.signInWithOAuth({
		provider: "discord",
		options: { redirectTo: `${origin}/auth/callback` },
	});

	if (error || !data.url) {
		throw new Error(error?.message ?? "Could not start sign-in");
	}

	redirect(data.url);
}

export async function signOut() {
	const supabase = await createClient();
	const { data } = await supabase.auth.getClaims();
	const invited = data?.claims.email
		? (await supabase.rpc("current_user_invited")).data === true
		: undefined;

	await supabase.auth.signOut();
	redirect(invited === false ? "/not-invited" : "/login");
}

/**
 * The four roster actions below share one shape: `useActionState` hands them the
 * previous message, and they return an error message for the player or null.
 */
type Message = string | null;

const CONFLICT = "This character changed elsewhere. Reopen it.";

async function session() {
	const supabase = await createClient();
	// getClaims, not getUser: matches proxy.ts's check, so this can't disagree
	// with it and redirect-loop.
	const { data, error } = await supabase.auth.getClaims();
	if (error || !data?.claims) redirect("/login");
	return { supabase, userId: data.claims.sub };
}

function isDocument(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function createCharacter(): Promise<Message> {
	const { supabase, userId } = await session();

	const { data: created, error } = await supabase
		.from("characters")
		.insert({ owner: userId, data: newCharacter() })
		.select("id")
		.single()
		.overrideTypes<{ id: string }, { merge: false }>();
	if (error || !created) return "Could not create the character.";

	revalidatePath("/");
	redirect(`/character/${created.id}`);
}

export async function renameCharacter(
	_previous: Message,
	form: FormData,
): Promise<Message> {
	const id = String(form.get("id") ?? "");
	const name = String(form.get("name") ?? "").trim();
	const { supabase } = await session();
	const { data: row, error } = await supabase
		.from("characters")
		.select("data, version")
		.eq("id", id)
		.single()
		.overrideTypes<{ data: unknown; version: number }, { merge: false }>();

	const document = row?.data;
	if (error || !row || !isDocument(document))
		return "Could not find that character.";

	const { data: written, error: writeError } = await supabase
		.from("characters")
		.update({ data: { ...document, name } })
		.eq("id", id)
		.eq("version", row.version)
		.select("id");

	if (writeError) return "Could not rename the character.";
	if (!written?.length) return CONFLICT;

	revalidatePath("/");
	return null;
}

export async function duplicateCharacter(
	_previous: Message,
	form: FormData,
): Promise<Message> {
	const id = String(form.get("id") ?? "");
	const { supabase, userId } = await session();

	const { data: row, error } = await supabase
		.from("characters")
		.select("data")
		.eq("id", id)
		.single()
		.overrideTypes<{ data: unknown }, { merge: false }>();

	const document = row?.data;
	if (error || !isDocument(document)) return "Could not copy that character.";

	const source = typeof document.name === "string" ? document.name.trim() : "";
	const { error: writeError } = await supabase.from("characters").insert({
		owner: userId,
		data: { ...document, name: `${source || "Unnamed"} (copy)` },
		share_token: null, // Explicit: a copy must not inherit a live share link.
	});
	if (writeError) return "Could not copy that character.";

	revalidatePath("/");
	return null;
}

export async function deleteCharacter(
	_previous: Message,
	form: FormData,
): Promise<Message> {
	const id = String(form.get("id") ?? "");
	const { supabase } = await session();

	const { error } = await supabase.from("characters").delete().eq("id", id);
	if (error) return "Could not delete the character.";

	revalidatePath("/");
	return null;
}

export async function importCharacter(
	_previous: Message,
	form: FormData,
): Promise<Message> {
	const raw = form.get("document");
	if (typeof raw !== "string") return "Could not read that file.";

	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch {
		return "That file is not valid JSON.";
	}

	let document: Character;
	try {
		document = migrate(parsed);
	} catch (error) {
		return error instanceof Error
			? error.message
			: "That file is not a character export.";
	}

	const { supabase, userId } = await session();
	const { error } = await supabase
		.from("characters")
		.insert({ owner: userId, data: document });
	if (error) return "Could not import that character.";

	revalidatePath("/");
	return null;
}

export type ShareState = { token: string | null; error: string | null };

export async function generateShareLink(
	_previous: ShareState,
	form: FormData,
): Promise<ShareState> {
	const id = String(form.get("id") ?? "");
	const { supabase } = await session();
	const token = crypto.randomUUID();

	const { error } = await supabase
		.from("characters")
		.update({ share_token: token })
		.eq("id", id);
	if (error) return { token: null, error: "Could not create the link." };

	revalidatePath("/");
	return { token, error: null };
}

export async function revokeShareLink(
	_previous: ShareState,
	form: FormData,
): Promise<ShareState> {
	const id = String(form.get("id") ?? "");
	const { supabase } = await session();

	const { error } = await supabase
		.from("characters")
		.update({ share_token: null })
		.eq("id", id);
	if (error) return { token: null, error: "Could not revoke the link." };

	revalidatePath("/");
	return { token: null, error: null };
}
