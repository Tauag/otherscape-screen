import { redirect } from "next/navigation";
import { requireAdmin } from "@/app/admin/_lib/require-admin";

/**
 * The /character board is the real editor; RLS (admin_write_characters)
 * already lets an admin write any row, so there's nothing admin-specific to
 * render here. This route exists only so the admin panel has a stable link
 * to send an admin to it.
 */
export default async function AdminEditCharacterPage({
	params,
}: PageProps<"/admin/[userId]/[characterId]/edit">) {
	const { characterId } = await params;
	await requireAdmin();
	redirect(`/character/${characterId}`);
}
