import { notFound } from "next/navigation";
import { requireAdmin } from "@/app/admin/_lib/require-admin";
import { migrate } from "@/app/admin/campaigns/_lib/migrate";
import { RosterAppBar } from "@/components/roster-app-bar";
import { accountName } from "@/lib/account-name";

export default async function CampaignPage({
	params,
}: PageProps<"/admin/campaigns/[id]">) {
	const { id } = await params;
	const { supabase, user } = await requireAdmin();

	const { data: row, error } = await supabase
		.from("campaigns")
		.select("data")
		.eq("id", id)
		.maybeSingle()
		.overrideTypes<{ data: unknown }, { merge: false }>();

	if (error || !row) notFound();

	const campaign = migrate(row.data);

	return (
		<main className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
			<RosterAppBar
				title={campaign.name.trim() || "Unnamed"}
				accountName={accountName(user)}
				isAdmin
			/>
		</main>
	);
}
