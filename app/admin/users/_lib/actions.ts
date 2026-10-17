"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/app/admin/_lib/require-admin";
import { parseInviteTarget } from "@/app/admin/users/_lib/invite-target";
import { createServiceClient } from "@/lib/supabase/service";

/** Same useActionState shape as the campaign actions. */
type Message = string | null;

// Both tables have RLS on with no policies, so writes go through the service
// client after requireAdmin has proved the caller.

export async function inviteUser(
	_previous: Message,
	form: FormData,
): Promise<Message> {
	const target = parseInviteTarget(String(form.get("target") ?? ""));
	if (!target) return "Enter an email or a Discord ID (17-20 digits).";

	await requireAdmin();
	const db = createServiceClient();
	const { error } =
		target.kind === "email"
			? await db.from("invited_emails").insert({ email: target.value })
			: await db
					.from("invited_discord_ids")
					.insert({ discord_id: target.value });
	if (error?.code === "23505") return "Already invited.";
	if (error) return "Could not invite. Try again.";

	revalidatePath("/admin/users");
	return null;
}

export async function removeInvite(form: FormData) {
	const target = parseInviteTarget(String(form.get("target") ?? ""));
	if (!target) return;

	await requireAdmin();
	const db = createServiceClient();
	if (target.kind === "email")
		await db.from("invited_emails").delete().eq("email", target.value);
	else
		await db
			.from("invited_discord_ids")
			.delete()
			.eq("discord_id", target.value);
	revalidatePath("/admin/users");
}
