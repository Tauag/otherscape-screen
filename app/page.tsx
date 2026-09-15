import { redirect } from "next/navigation";
import { signOut } from "@/lib/actions";
import { CharacterCard, NewCharacterBar } from "@/app/_components/roster-controls";
import { relativeTime } from "@/lib/relative-time";
import { createClient } from "@/lib/supabase/server";

// The generated columns and nothing else. The document never travels here.
type RosterRow = {
  id: string;
  name: string | null;
  essence: string | null;
  updated_at: string;
  share_token: string | null;
};

export default async function RosterPage() {
  const supabase = await createClient();
  const { data: account } = await supabase.auth.getUser();
  const user = account.user;
  if (!user) redirect("/login");

  const { data: characters, error } = await supabase
    .from("characters")
    .select("id, name, essence, updated_at, share_token")
    .eq("owner", user.id)
    .order("updated_at", { ascending: false })
    .overrideTypes<RosterRow[], { merge: false }>();

  const metadata = user.user_metadata as Record<string, unknown>;
  const accountName =
    [metadata.full_name, metadata.name, user.email].find(
      (value): value is string => typeof value === "string" && value.length > 0,
    ) ?? "Account";

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col">
      <header className="flex items-center justify-between gap-3 px-5 pt-6 pb-4">
        <h1 className="font-display text-[19px] font-bold tracking-[0.16em] uppercase">
          Characters
        </h1>

        <form action={signOut}>
          <button
            type="submit"
            className="flex min-h-11 items-center gap-2 rounded-[20px] border border-border py-1 pr-3 pl-1.5"
          >
            <span
              aria-hidden="true"
              className="grid size-[22px] place-items-center rounded-full bg-border font-display text-[11px] font-bold text-text"
            >
              {accountName.trim().charAt(0).toUpperCase()}
            </span>
            <span className="font-sans text-xs text-dim">{accountName}</span>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-3.5 text-faint"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 17l5-5-5-5" />
              <path d="M20 12H9" />
              <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" />
            </svg>
            <span className="sr-only">Sign out</span>
          </button>
        </form>
      </header>

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

        {characters?.map((character) => (
          <CharacterCard
            key={character.id}
            id={character.id}
            name={character.name ?? ""}
            essence={character.essence ?? ""}
            shared={character.share_token !== null}
            updatedAt={character.updated_at}
            edited={relativeTime(character.updated_at)}
          />
        ))}
      </div>

      <div className="sticky bottom-0 bg-bg px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <NewCharacterBar />
      </div>
    </main>
  );
}
