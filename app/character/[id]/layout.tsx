import { notFound, redirect } from "next/navigation";
import { CharacterProvider } from "@/app/character/[id]/provider";
import { TabBar } from "@/app/character/[id]/tabs";
import { migrate } from "@/lib/character/migrate";
import { createClient } from "@/lib/supabase/server";

// The one read of the document. Tabs under /character/[id] are routes inside this
// layout, so switching them refetches nothing.
export default async function CharacterLayout({ children, params }: LayoutProps<"/character/[id]">) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: account } = await supabase.auth.getUser();
  if (!account.user) redirect("/login");

  const { data: row, error } = await supabase
    .from("characters")
    .select("data, version, updated_at")
    .eq("id", id)
    .maybeSingle()
    .overrideTypes<{ data: unknown; version: number; updated_at: string }, { merge: false }>();

  if (error || !row) notFound();

  return (
    <CharacterProvider
      id={id}
      document={migrate(row.data)}
      version={row.version}
      updatedAt={row.updated_at}
      bar={<TabBar id={id} />}
    >
      {children}
    </CharacterProvider>
  );
}
