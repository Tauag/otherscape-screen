"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/app/admin/_lib/require-admin";

export async function setDiscordEnabled(
	characterId: string,
	enabled: boolean,
): Promise<void> {
	const { supabase } = await requireAdmin();

	const { error } = await supabase
		.from("characters")
		.update({ discord_enabled: enabled })
		.eq("id", characterId);
	if (error) throw new Error("Could not update the Discord setting.");

	revalidatePath("/admin/users/[userId]", "page");
}
