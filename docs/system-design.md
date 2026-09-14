# Metro:Otherscape Character Sheet — System design

Status: draft v1
Owner: Gavin Li
Related: [PRD.md](./PRD.md) (what and why), [design.md](./design.md) (interface),
[tasks.md](./tasks.md) (build order)

This document holds the technical decisions. It replaces the removed infra plan.

## 1. Shape

Next.js (App Router) on Vercel. One Supabase project for Postgres and Auth. The
browser talks to Supabase directly. Row-level security is the authorization
boundary. Only two pages render on the server: sign-in and the share page.

```
Phone / desktop (PWA)
  ├── supabase-js ──► Supabase   (Postgres + RLS, Google Auth)
  └── /s/<token>  ──► Next server component ──► Supabase (anon, one RPC)
```

The stack matches the household-inventory project, so the auth wiring, the
`proxy.ts` session refresh, and the migration workflow port across unchanged.
Nothing here needs a second service: no queue, no cache, no search index, no
storage bucket.

**Not used, on purpose.** No ORM. No state library. No data-fetching library. No
Supabase Realtime, because real-time multiplayer is a PRD non-goal. No CRDT. No
server-side search: one player owns at most a few characters.

## 2. The central decision: a character is one JSON document

One `characters` row holds the whole sheet in a `jsonb` column. Themes, tags,
tracks, loadout, ghost memories, statuses, and story tags all live inside it.

The domain model is a deep tree with a single owner, and no screen and no
feature ever queries across characters. A relational schema would cost eight
tables, eight RLS policies, a join to load one sheet, and a migration for every
model change. The document costs one table.

What the document buys directly:

| PRD requirement | Cost with a document |
|---|---|
| 7.12 Export and import | `JSON.stringify(data)`, and a validated insert back |
| 7.13 Offline | One value to cache, one value to push |
| 7.2 Undo | A stack of previous documents |
| 6 Ghost memories | A snapshot is a copy of a subtree |
| 7.4 Respec | Replace a subtree, keep the rest |

What it costs: no SQL can ask "which characters hold a burnt tag". Nobody asks
that. And Postgres cannot enforce the sheet's shape, so validation lives in
TypeScript instead.

`data.schema_version` carries the document version. A `migrate(doc)` function
upgrades old documents on read, in code, never in SQL.

### Every tag carries its own id

A tag records the themebook and question letter it answers, but that pair is a
label, never a key. design.md section 3 allows a question to be answered more
than once, so one theme can hold two tags marked `B`. A tag therefore gets its
own id when it is created.

Without the id, nothing downstream can tell those two tags apart: the reducer
cannot burn one, reorder cannot move one, and the roll builder cannot select
one. Keying tags by letter would work on every sheet until the first player
answers a good question twice.

For the same reason, no screen treats a question as consumed. The theme editor
offers the full A to J range, and the readiness check counts tags, never
distinct letters.

`lazy:` whole-document reads and writes. The ceiling is roughly 100 KB per
character, well past a real sheet at about 15 KB. The upgrade path is to split
the hot play state into its own column, which also splits the conflict case.

## 3. Schema

```sql
create extension if not exists pgcrypto;

create table characters (
  id          uuid primary key default gen_random_uuid(),
  owner       uuid not null references auth.users on delete cascade,
  data        jsonb not null,
  version     int  not null default 1,
  share_token uuid unique,
  name        text generated always as (data->>'name') stored,
  essence     text generated always as (data->>'essence') stored,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index on characters (owner, updated_at desc);

create table content_packs (
  id         text primary key,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);
```

`name` and `essence` are generated columns, so the roster lists every character
without downloading every document, and the label can never drift from the
document. A trigger or a client-written duplicate could both go stale.

### Concurrency

```sql
create function bump_version() returns trigger
language plpgsql as $$
begin
  new.version    = old.version + 1;
  new.updated_at = now();
  return new;
end;
$$;

create trigger characters_bump_version
  before update on characters
  for each row execute function bump_version();
```

Every save carries the version the client last read:

```sql
update characters set data = $1 where id = $2 and version = $3
```

Zero rows updated means another device saved first. The trigger owns `version`,
so a client cannot forge it.

This is not multiplayer. It is one player with a phone at the table and a laptop
open at home. The check costs one integer and one where-clause, and without it
the laptop silently erases an evening of status marks.

### Row-level security

```sql
alter table characters enable row level security;

create policy own_characters on characters
  for all to authenticated
  using (owner = auth.uid())
  with check (owner = auth.uid());

revoke all on characters from authenticated;
grant select, delete on characters to authenticated;
grant insert (owner, data, share_token) on characters to authenticated;
grant update (data, share_token) on characters to authenticated;

alter table content_packs enable row level security;
create policy read_pack on content_packs
  for select to authenticated using (true);
```

Column grants keep `id`, `version`, `created_at`, and `updated_at` out of client
hands. `owner` is insert-only, so a character cannot be handed to someone else.

No member allowlist. Every Google account owns its own characters, unlike
household-inventory where one household shares one dataset. If strangers ever
sign up, add a `members` table and one clause to the policy.

## 4. Sharing

`share_token` is a v4 UUID, so the link is a capability with 122 bits of
entropy. Null means not shared. Revoking is one update to null. Re-sharing
generates a new token, so an old link dies.

Anonymous readers reach exactly one function:

```sql
create function shared_character(token uuid) returns jsonb
language sql security definer set search_path = public stable as $$
  select data from characters where share_token = token;
$$;

revoke execute on function shared_character(uuid) from public;
grant execute on function shared_character(uuid) to anon, authenticated;
```

`/s/[token]` is a server component that calls it and renders read-only HTML. The
reader gets no editor bundle, no Supabase client, and no write path. The service
role key never enters the application, so no route can leak more than this one
function returns.

The share page renders tags, their question letters, tracks, and statuses. It
never renders content-pack text. That holds the PRD's non-goal on publishing
themebook wording, and `content_packs` is unreadable by `anon` anyway.

## 5. Auth

Supabase Auth, Google as the only provider. Session in an httpOnly cookie via
`@supabase/ssr`, refreshed in `proxy.ts` (Next.js 16 renamed `middleware.ts`).
This is the household-inventory wiring with the membership check removed.

`/s/<token>` is the one public route. Everything else redirects to sign-in.

## 6. Content pack

One `content_packs` row, id `themebooks`, holding the existing
`content/themebooks.json`: 78 KB, 14 themebooks, each with its questions,
motivation guidance, crew scenarios, and five specials.

The file is publisher text and stays out of git, so it cannot ship in the build.
A hand-run script (`scripts/upload-pack.ts`, service role key from the local
environment) writes the row. Deploying the text is a deployment act, exactly as
the PRD says.

With no row present the app still works. `lib/content/fallback.ts` holds the 14
themebook names, types, and the question letters A to J and A to D. That list is
already public: it is printed in the PRD. Every text slot renders empty, and the
tag editor shows "power tag question B" over a blank field.

The client fetches the pack once and caches it in `localStorage`, keyed by
`updated_at`. Refilling the pack changes the key and every device refetches.

## 7. Rules engine

`lib/rules/` holds pure functions. No React, no Supabase, no I/O.

| Function | PRD |
|---|---|
| `power(selection)` → breakdown and total | 7.8 |
| `raiseStatus(marks, tier)`, `lowerStatus(marks, tiers)` | 7.7 |
| `essenceCandidates(themes)` | 7.5 |
| `loadoutSpend(loadout)` and the budget warning | 7.6 |
| `readiness(character)` → list of sentences | 7.1 |
| `roll2d6(power)` → strong, mixed, or miss | 7.9 |

`power` returns the breakdown as a list of labelled values, never a bare number,
because design.md prints the arithmetic above the total. It counts one positive
tag as +1 and one negative as −1, counts only the highest positive status tier
and the highest negative status tier, and reads a burnt tag's own burn value
(default 3, set per burn because theme specials change it).

`constants.ts` holds the numbers the PRD has not confirmed: decay track length
(O2), starting loadout Power (O5), starting tag counts (O4). Answering an open
question is then a one-line edit, not a search.

**The check.** `lib/rules/__tests__/*.test.ts` under `node --test`, no framework
and no fixtures. This is the arithmetic the Google Sheet gets wrong by hand, so
it is the one part of the app that must be tested: status stacking past an
occupied tier, removal pushing marks below tier 1, a burn at 4 or 5, outranked
statuses excluded from the total.

## 8. State, autosave, and offline

One `useReducer` per open character, in a context provider on the `/c/[id]`
layout. Reducer actions are the domain verbs: `burnTag`, `markUpgrade`,
`raiseStatus`, `loseTheme`. No state library. The document is the state.

Every dispatch does three things:

1. Replace the document in memory.
2. Write it to `localStorage`.
3. Schedule a save, debounced about 800 ms, flushed on `pagehide` and
   `visibilitychange`.

Because step 2 already happened, offline editing needs no new machinery. A
service worker caches the app shell and the content pack. A dirty document
retries its save on the `online` event.

Undo (P1) is a 20-deep stack of previous documents.
`lazy:` full snapshots, roughly 300 KB at the ceiling. The upgrade path is to
store the inverse action instead.

On a version conflict the client keeps the local document and asks which to
keep. It never discards an edit to resolve a conflict, because the PRD says no
offline edit is lost.
`lazy:` manual resolution, no merge. One player with two devices hits this
rarely, and the two documents are both readable.

## 9. Routes

```
/                      roster, server component, generated columns only
/login, /auth/callback sign-in
/c/[id]                layout: loads the document, owns the tab bar
  /c/[id]              sheet          (design.md: Main)
  /c/[id]/theme/[tid]  one theme      (Theme)
  /c/[id]/loadout      loadout        (Loadout)
  /c/[id]/play         statuses       (Play)
  /c/[id]/roll         roll builder   (Roll)
  /c/[id]/reference    cheatsheet     (Reference)
/c/[id]/create         guided creation, step N of 10  (Create)
/s/[token]             read-only share
```

Tabs are routes, not component state, so the phone back button works and a
player can deep-link a theme. The document loads once in the layout, so no tab
switch refetches.

The desktop artboard is the same tree. At `lg:` the layout renders sheet, play,
and roll as three panes and drops the tab bar. CSS decides, not a second set of
components.

Roll-builder selection is throwaway state in the layout provider. It is never
saved, per 7.8.

## 10. Interface plumbing

**design.md is the design system.** It already fixes the palette, the meaning
each colour carries, the three faces, and the hit-target floor. The engineering
job is to encode those tokens, not to adopt someone else's.

So there is no component library. MUI, Mantine, Chakra, and Ant all ship a
visual language this design replaces on every surface, and overriding one costs
more than writing a chip. Tailwind v4 plus a few headless primitives is the
whole stack.

`next/font/google` self-hosts Chakra Petch, Barlow, and JetBrains Mono at build
time, so the table's phones load no font over a venue's wifi.

### Tokens, and why colour is a data attribute

Tailwind v4 takes its config in CSS, so design.md section 2 becomes one `@theme`
block in `globals.css`. A component never writes a hex.

A tag's hue is data, not a style choice: it comes from the type of the theme the
tag belongs to. Writing `` className={`text-${type}`} `` would defeat Tailwind,
which cannot generate a class it never sees as literal text. Instead the theme
card carries the type and the hue rides down the cascade:

```css
[data-type='self']   { --hue: var(--color-self);   --hue-text: var(--color-self-text); }
[data-type='mythos'] { --hue: var(--color-mythos); --hue-text: var(--color-mythos-text); }
[data-type='noise']  { --hue: var(--color-noise);  --hue-text: var(--color-noise-text); }
```

Every chip inside then paints with `var(--hue)` and never learns which type it
is. That is design.md's "every tag inherits the hue of the theme it came from",
with no conditional in React and no colour map to keep in sync. Valence works
the same way, on `data-valence`, and burnt overrides the hue because burning is
a state, not an origin.

### What actually needs a library

The artboards hold fewer real widgets than they look like they do.

| Element | Built from |
|---|---|
| Tag chip, selectable, with its ±value | `<button aria-pressed>` |
| Upgrade, Decay, and status tier boxes | `<input type=checkbox>` |
| Theme card, tag set, status card | `<section>` and CSS |
| Bottom bar | `<nav>` of `<Link>`, `aria-current="page"` |
| Themebook, question, and essence pickers | A route, not an overlay |
| Tag text, names, Identity line | `<input type=text>` |
| Appearance, background, specials | `<textarea>`, `field-sizing: content` |
| Reference filter, the only search field | `<input type=search>` and `Array.filter` |
| Theme type, and any 3-option choice | A radio group, styled as a segmented control |
| Save state | One `aria-live` region |
| Confirm a lost theme, take an Upgrade, override a burn value, resolve a conflict | Base UI `Dialog` |

No artboard holds a dropdown, a `<select>`, or a caret. Every choice in this app
carries explanatory text, so it reads as a list screen instead: picking a
themebook means reading six concepts, and picking a special means reading five
rules. Section 9 already makes those routes, so they are a `<ul>` of `<Link>`.

The form-library category is absent too. The PRD computes and warns rather than
blocking, and section 8 saves every keystroke, so there is no submit, no
validation pass, and no error state to render.

Reorder (PRD 7.3) is the one fiddly interaction. It ships as move-up and
move-down buttons, which touch and screen readers both get for free.
`lazy:` no drag-and-drop. The ceiling is a theme with many tags, where dragging
would be quicker. The upgrade path is `dnd-kit` on the tag list alone.

If a combobox ever earns its place, such as searching all 140 questions at once,
Base UI is already a dependency and supplies one.

Base UI supplies `Dialog`, and `Popover` if a desktop picker ever wants one.
Focus traps and dismissal are the two things worth a dependency, per the
accessibility rule. Everything else is a native element that already carries its
own semantics and keyboard behaviour.

The bottom bar is navigation, not a tabs widget. Section 9 makes each key a
route, so a tabs component would be the wrong control and would break the back
button.

shadcn/ui is the near miss. Its value is a styled layer over Radix, and this
design discards the styling, so it would cost a generator, a `components.json`,
and the `cva` stack to obtain one Dialog. The data-attribute scheme above also
removes most conditional class juggling, which is the other half of what shadcn
brings.

### Icons

23 distinct icons across 49 uses, already drawn in the artboards at 24 px with
round caps. That is Lucide's grammar, so `lucide-react` matches them and
tree-shakes to the 23. Pasting the SVGs instead is a fair trade and drops the
dependency.

Hit targets are 44 px, from design.md section 1.

## 11. Cost

$0/month. Supabase free tier gives 500 MB of database and 50k monthly active
users; a table of five players stores under 1 MB. Vercel Hobby covers the
hosting.

A free Supabase project pauses after seven days without a request, and a
fortnightly campaign hits that between sessions. A paused project on game night
is the one predictable failure here. One Vercel cron, daily (the Hobby limit),
calling a route that runs `select 1`, prevents it.

## 12. Build order

| Step | Contents | Milestone |
|---|---|---|
| 1 | Supabase project, migration, Google provider | M1 |
| 2 | Next shell, `proxy.ts`, sign-in, roster, empty document, autosave | M1 |
| 3 | Rules engine and its tests, ahead of the screens that call it | M2 |
| 4 | Sheet: themes, tags, tracks, Identity line, Essence, loadout | M2 |
| 5 | Content pack row and upload script | M2 |
| 6 | Guided creation and the readiness check | M2.5 |
| 7 | Play state, roll builder, reference | M3 |
| 8 | Share token, `/s/[token]` page, export and import | M4 |
| 9 | Service worker, manifest, offline conflict prompt | M4 |
| 10 | Dice roller, undo, losing and replacing themes | P1 |

Ship after step 7 and run a session from a phone. Nothing after it is worth
building before that test happens.

## 13. Open

- PRD O1 to O6 are answered. `constants.ts` (T16) still needs to encode O2 to
  O5, and `power` (T17) needs O1's rule.
- design.md leaves the three type hues unconfirmed against the Google Sheet.
- Whether the content pack ever holds the rulebook wording. The app runs either
  way, which is the point of section 6.
