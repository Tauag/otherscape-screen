import { notFound, redirect } from "next/navigation";
import { BoardBar } from "@/app/character/[id]/_components/layout/board-bar";
import { CharacterProvider } from "@/app/character/[id]/_components/layout/character-provider";
import { TabBar } from "@/app/character/[id]/_components/layout/tabs";
import { RollSelectionProvider } from "@/app/character/[id]/_components/roll-selection";
import { migrate } from "@/lib/character/migrate";
import { createClient } from "@/lib/supabase/server";

export default async function CharacterLayout({
	children,
	params,
}: LayoutProps<"/character/[id]">) {
	const { id } = await params;
	const supabase = await createClient();

	const { data: account } = await supabase.auth.getUser();
	if (!account.user) redirect("/login");

	const { data: row, error } = await supabase
		.from("characters")
		.select("data, version, updated_at, share_token")
		.eq("id", id)
		.maybeSingle()
		.overrideTypes<
			{
				data: unknown;
				version: number;
				updated_at: string;
				share_token: string | null;
			},
			{ merge: false }
		>();

	if (error || !row) notFound();

	// Above CharacterProvider, so the tab bar's centre key reads the same live
	// selection the roll screen edits.
	return (
		<RollSelectionProvider>
			<CharacterProvider
				id={id}
				document={migrate(row.data)}
				version={row.version}
				updatedAt={row.updated_at}
				shareToken={row.share_token}
				bar={<TabBar key={`tab-bar-${id}`} id={id} />}
				topBar={
					<BoardBar
						key={`board-bar-${id}`}
						id={id}
						shareToken={row.share_token}
					/>
				}
			>
				{children}
			</CharacterProvider>
		</RollSelectionProvider>
	);
}
