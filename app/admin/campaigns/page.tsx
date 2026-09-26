import type { Metadata } from "next";
import { requireAdmin } from "@/app/admin/_lib/require-admin";
import { CampaignRow } from "@/app/admin/campaigns/_components/campaign-row";
import { NewCampaignForm } from "@/app/admin/campaigns/_components/new-campaign-form";
import { migrate } from "@/app/admin/campaigns/_lib/migrate";
import { RosterAppBar } from "@/components/roster-app-bar";
import { accountName } from "@/lib/account-name";
import { relativeTime } from "@/lib/relative-time";

export const metadata: Metadata = { title: "Admin · Campaigns" };

type CampaignListRow = {
	id: string;
	data: unknown;
	updated_at: string;
	campaign_characters: { count: number }[];
};

export default async function CampaignsPage() {
	const { supabase, user } = await requireAdmin();

	const { data: campaigns, error } = await supabase
		.from("campaigns")
		.select("id, data, updated_at, campaign_characters(count)")
		.order("updated_at", { ascending: false })
		.overrideTypes<CampaignListRow[], { merge: false }>();

	return (
		<main className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
			<RosterAppBar title="Campaigns" accountName={accountName(user)} isAdmin />

			<div className="flex flex-1 flex-col gap-4 px-5 pb-4">
				<div className="mx-auto w-full max-w-2xl">
					<NewCampaignForm />
				</div>

				{error && (
					<p className="font-sans text-sm text-negative-text">
						Could not load campaigns. Reload the page.
					</p>
				)}

				{campaigns?.length === 0 && (
					<p className="font-sans text-sm text-dim">No campaigns yet.</p>
				)}

				<div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{campaigns?.map((row) => {
						const campaign = migrate(row.data);
						return (
							<CampaignRow
								key={row.id}
								id={row.id}
								name={campaign.name}
								npcCount={campaign.npcs.length}
								storyTagCount={campaign.storyTags.length}
								characterCount={row.campaign_characters[0]?.count ?? 0}
								updatedAt={row.updated_at}
								edited={relativeTime(row.updated_at)}
							/>
						);
					})}
				</div>
			</div>
		</main>
	);
}
