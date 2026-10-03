import { notFound } from "next/navigation";
import { LiveRefresh } from "@/components/live-refresh";
import { ShareSheet } from "@/components/share-sheet";
import { migrate } from "@/lib/character/migrate";
import { createClient } from "@/lib/supabase/server";

export default async function SharePage({ params }: PageProps<"/s/[token]">) {
	const { token } = await params;
	const supabase = await createClient();

	const { data, error } = await supabase.rpc("shared_character", { token });
	if (error || !data) notFound();

	return (
		<>
			<LiveRefresh topics={[`share:${token}`]} />
			<ShareSheet character={migrate(data)} />
		</>
	);
}
