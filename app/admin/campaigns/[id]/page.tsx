import { notFound } from "next/navigation";
import { requireAdmin } from "@/app/admin/_lib/require-admin";
import { AssignedCharacters } from "@/app/admin/campaigns/[id]/_components/assigned-characters";
import { migrate } from "@/app/admin/campaigns/_lib/migrate";
import { accountName } from "@/lib/account-name";
import { CampaignProvider } from "./_components/campaign-provider";
import { CampaignScreen } from "./_components/campaign-screen";

export default async function CampaignPage({
	params,
}: PageProps<"/admin/campaigns/[id]">) {
	const { id } = await params;
	const { supabase, user } = await requireAdmin();

	const { data: row, error } = await supabase
		.from("campaigns")
		.select("data, version, updated_at")
		.eq("id", id)
		.maybeSingle()
		.overrideTypes<
			{ data: unknown; version: number; updated_at: string },
			{ merge: false }
		>();

	if (error || !row) notFound();

	const campaign = migrate(row.data);

	return (
		<CampaignProvider
			id={id}
			document={campaign}
			version={row.version}
			updatedAt={row.updated_at}
		>
			<CampaignScreen
				accountName={accountName(user)}
				characters={<AssignedCharacters campaignId={id} />}
			/>
		</CampaignProvider>
	);
}
