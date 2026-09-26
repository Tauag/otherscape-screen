import { redirect } from "next/navigation";
import {
	CharacterCard,
	ImportBar,
	NewCharacterBar,
} from "@/app/_components/roster-controls";
import { RosterAppBar } from "@/components/roster-app-bar";
import { accountName } from "@/lib/account-name";
import { relativeTime } from "@/lib/relative-time";
import { parseRosterSummary } from "@/lib/roster";
import { createClient } from "@/lib/supabase/server";

type RosterRow = {
	id: string;
	name: string | null;
	essence: string | null;
	updated_at: string;
	share_token: string | null;
	roster_summary: unknown;
};

export default async function RosterPage() {
	const supabase = await createClient();
	// getClaims, not getUser: proxy.ts gates this route on getClaims, and a
	// page re-checking with the network-verified getUser can disagree with it
	// (valid JWT, revoked session) and redirect-loop against the proxy.
	const { data: account } = await supabase.auth.getClaims();
	const claims = account?.claims;
	if (!claims) redirect("/login");
	const user = {
		id: claims.sub,
		email: claims.email,
		user_metadata: claims.user_metadata,
	};

	const { data: characters, error } = await supabase
		.from("characters")
		.select("id, name, essence, updated_at, share_token, roster_summary")
		.eq("owner", user.id)
		.order("updated_at", { ascending: false })
		.overrideTypes<RosterRow[], { merge: false }>();

	const { data: isAdmin } = await supabase.rpc("current_user_is_admin");

	return (
		<main className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
			<RosterAppBar
				title="Characters"
				accountName={accountName(user)}
				isAdmin={isAdmin === true}
			/>

			<div className="flex flex-1 flex-col gap-3 px-5 pb-4">
				{error && (
					<p className="font-sans text-sm text-negative-text">
						Could not load your characters. Reload the page.
					</p>
				)}

				{characters?.length === 0 && (
					<div className="flex flex-col gap-2 py-10">
						<p className="font-mono text-xs tracking-[0.08em] text-faint uppercase">
							No characters yet
						</p>
						<p className="font-sans text-sm text-dim">Start one below.</p>
					</div>
				)}

				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{characters?.map((character) => (
						<CharacterCard
							key={character.id}
							id={character.id}
							name={character.name ?? ""}
							essence={character.essence ?? ""}
							shared={character.share_token !== null}
							updatedAt={character.updated_at}
							edited={relativeTime(character.updated_at)}
							summary={parseRosterSummary(character.roster_summary)}
						/>
					))}
				</div>
			</div>

			<div className="sticky bottom-0 mx-auto w-full max-w-md bg-bg px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
				<NewCharacterBar />
				<ImportBar />
			</div>
		</main>
	);
}
