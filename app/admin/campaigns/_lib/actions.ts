"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/app/admin/_lib/require-admin";
import { newCampaign } from "@/app/admin/campaigns/_lib/new";

/** Same useActionState shape as lib/actions.ts's roster actions. */
type Message = string | null;

export async function createCampaign(
	_previous: Message,
	form: FormData,
): Promise<Message> {
	const name = String(form.get("name") ?? "").trim();
	if (!name) return "Name the campaign first.";

	const { supabase, user } = await requireAdmin();
	const { data: created, error } = await supabase
		.from("campaigns")
		.insert({ owner: user.id, data: { ...newCampaign(), name } })
		.select("id")
		.single()
		.overrideTypes<{ id: string }, { merge: false }>();
	if (error || !created) return "Could not create the campaign.";

	revalidatePath("/admin/campaigns");
	redirect(`/admin/campaigns/${created.id}`);
}

export async function deleteCampaign(
	_previous: Message,
	form: FormData,
): Promise<Message> {
	const id = String(form.get("id") ?? "");
	const { supabase } = await requireAdmin();

	// The campaign_characters FK cascade removes the campaign's assignment
	// rows; the characters themselves are untouched.
	const { error } = await supabase.from("campaigns").delete().eq("id", id);
	if (error) return "Could not delete the campaign.";

	revalidatePath("/admin/campaigns");
	return null;
}

export async function assignCharacters(
	_previous: Message,
	form: FormData,
): Promise<Message> {
	const campaignId = String(form.get("campaignId") ?? "");
	const characterIds = form.getAll("characterId").map(String);
	if (!campaignId) return "Missing campaign.";
	if (characterIds.length === 0) return "Choose at least one character.";

	const { supabase } = await requireAdmin();
	// The picker only offers unassigned characters, so a PK conflict here is
	// just a stale error message, not a state the admin needs to resolve.
	const { error } = await supabase.from("campaign_characters").insert(
		characterIds.map((characterId) => ({
			campaign_id: campaignId,
			character_id: characterId,
		})),
	);
	if (error) return "Could not assign the selected characters.";

	revalidatePath(`/admin/campaigns/${campaignId}`);
	return null;
}

export async function removeCharacter(
	_previous: Message,
	form: FormData,
): Promise<Message> {
	const campaignId = String(form.get("campaignId") ?? "");
	const characterId = String(form.get("characterId") ?? "");
	if (!campaignId || !characterId) return "Missing character.";

	const { supabase } = await requireAdmin();
	const { error } = await supabase
		.from("campaign_characters")
		.delete()
		.eq("campaign_id", campaignId)
		.eq("character_id", characterId);
	if (error) return "Could not remove the character.";

	revalidatePath(`/admin/campaigns/${campaignId}`);
	return null;
}
