"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { newCharacter } from "@/lib/character/new";
import { createClient } from "@/lib/supabase/server";

export async function signInWithGoogle() {
  const origin = (await headers()).get("origin");
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

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/**
 * The four roster actions below share one shape: `useActionState` hands them the
 * previous message, and they return an error message for the player or null.
 */
type Message = string | null;

const CONFLICT = "This character changed elsewhere. Reopen it.";

async function session() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/login");
  return { supabase, userId: data.user.id };
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

export async function renameCharacter(_previous: Message, form: FormData): Promise<Message> {
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
  if (error || !row || !isDocument(document)) return "Could not find that character.";

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

export async function duplicateCharacter(_previous: Message, form: FormData): Promise<Message> {
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

export async function deleteCharacter(_previous: Message, form: FormData): Promise<Message> {
  const id = String(form.get("id") ?? "");
  const { supabase } = await session();

  const { error } = await supabase.from("characters").delete().eq("id", id);
  if (error) return "Could not delete the character.";

  revalidatePath("/");
  return null;
}
