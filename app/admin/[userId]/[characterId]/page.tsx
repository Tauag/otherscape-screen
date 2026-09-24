import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/app/admin/_lib/require-admin";
import { ShareSheet } from "@/components/share-sheet";
import { migrate } from "@/lib/character/migrate";

export default async function AdminCharacterPage({
	params,
}: PageProps<"/admin/[userId]/[characterId]">) {
	const { userId, characterId } = await params;
	const { supabase } = await requireAdmin();

	const { data: row, error } = await supabase
		.from("characters")
		.select("data")
		.eq("id", characterId)
		.eq("owner", userId)
		.maybeSingle()
		.overrideTypes<{ data: unknown }, { merge: false }>();

	if (error || !row) notFound();

	return (
		<>
			<div className="mx-auto flex w-full max-w-md items-center justify-between gap-3 px-5 pt-6 md:max-w-3xl xl:max-w-5xl">
				<Link
					href={`/admin/${userId}`}
					className="font-mono text-[10px] tracking-[0.08em] text-dim uppercase"
				>
					Back
				</Link>
				<Link
					href={`/admin/${userId}/${characterId}/edit`}
					className="font-mono text-[10px] tracking-[0.08em] text-primary uppercase"
				>
					Edit
				</Link>
			</div>
			<ShareSheet character={migrate(row.data)} />
		</>
	);
}
