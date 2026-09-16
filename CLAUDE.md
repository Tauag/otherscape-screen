@AGENTS.md

## File layout

Colocate code with the route that uses it. A private folder (leading
underscore) never becomes a route segment, so it sits inside `app/`. A
segment's private folder serves that segment and everything below it.

- Used by one route subtree: `_components/`, `_hooks/`, `_lib/` inside that
  segment's folder.
- Used by two sibling subtrees: `components/`, `hooks/`, `lib/` at the repo
  root. `app/_components/` is for `/` alone, so anything `/login` also needs
  goes to the root instead.

A second subtree reaching into a private folder is the signal to move the file
up to the shared folder, not to deepen the import path.

A `page.tsx` holds only its default-exported top-level component, plus the
constants, prop types, and other pieces immediately relevant to that one
component. A sub-component, or a helper substantial enough to matter on its
own, moves to that segment's `_components/` (or `_lib/`), one file per piece.

## UI components

Use Base UI (`@base-ui/react`) for interactive elements: buttons, toggles,
dialogs, menus, inputs, and anything else it covers. Roll a custom component
only when Base UI has no matching primitive, or when using it would break
the feature (for example, `next/link` for routed navigation stays native).

## Migrations

Supabase CLI, linked to project `pclyysmrsuhftgwvdwor`. New SQL files go in
`supabase/migrations/`, named `supabase migration new <name>` would name them
(timestamp prefix + description).

**Claude writes migration files but never applies them.** The user runs
`supabase db push` themselves after reviewing the SQL. Don't run `db push`,
`db reset`, or paste migration SQL into the Supabase SQL editor on their
behalf.

Migration history lives in two places that must agree:
- the ordered files in `supabase/migrations/` (git, the real source of truth)
- the `supabase_migrations.schema_migrations` table on the remote db (what's
  actually been applied)

`supabase db push` is what keeps them in sync — it applies pending files and
records them in that table. Always use it to apply, even by hand; don't paste
migration SQL directly into the SQL editor, since that changes the schema
without recording it, and `supabase migration list` (local vs. remote) will
then show drift. If SQL ever is run by hand outside the CLI, reconcile with
`supabase migration repair --status applied <timestamp>` right after.

Once a migration has been pushed, don't edit its file. A later change is a
new migration file, so the applied history stays an append-only ledger of
what actually ran.