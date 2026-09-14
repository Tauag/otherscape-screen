# Metro:Otherscape Character Sheet — Task list

Status: draft v1
Owner: Gavin Li
Related: [PRD.md](./PRD.md) (what and why), [system-design.md](./system-design.md)
(technical decisions), [design.md](./design.md) (interface)

Tickets follow the build order in system-design.md section 12. Ship after S7 and
run a real session from a phone before starting S8.

| Step | Tickets | Milestone |
|---|---|---|
| S0 Rules research | T01-T02 | blocks M2 |
| S1 Supabase | T03-T05 | M1 |
| S2 Shell | T06-T15 | M1 |
| S3 Rules engine | T16-T20 | M2 |
| S4 Sheet | T21-T32 | M2 |
| S5 Content pack | T33-T35 | M2 |
| S6 Creation | T36-T38 | M2.5 |
| S7 Play | T39-T43 | M3 |
| S8 Share and export | T44-T47 | M4 |
| S9 Offline | T48-T51 | M4 |
| S10 Later | T52-T57 | P1 |

---

## S0 Rules research — done

### T01 Answer open questions O2 to O6 — done
Read the rulebook and record the answers in the PRD: decay track length (O2),
starting theme count and type limits (O3), starting tag counts (O4), starting
loadout Power (O5), the full themebook list (O6).
**Done when:** PRD section 9 lists each answer, and design.md section 5 drops the
matching unresolved item.
**Refs:** PRD O2-O6

### T02 Answer O1, rolling with Self, Mythos, or Noise — done
Confirm the rule on rulebook p.122. It changes the `power` signature, not a
constant, so settle it before T17.
**Done when:** the rule is written into PRD 7.8 as a sentence the roll builder can
implement.
**Refs:** PRD O1

---

## S1 Supabase

### T03 Create the Supabase project and enable Google auth
Create the project, enable the Google provider, and record the redirect URLs for
local and production. Keep the service role key out of the repo.
**Done when:** a Google sign-in from a scratch page returns a session.
**Refs:** sysdesign 5

### T04 Migration: characters and content_packs
One migration file. Both tables, the `name` and `essence` generated columns, the
`(owner, updated_at desc)` index, and the `pgcrypto` extension.
**Done when:** the migration applies to a clean database and an inserted row
reports its generated `name`.
**Refs:** sysdesign 3

### T05 Migration: version trigger, RLS, and column grants
The `bump_version` trigger, the `own_characters` policy, the `read_pack` policy,
and the column grants that keep `id`, `version`, `created_at`, and `updated_at`
out of client hands.
**Done when:** a client update to another user's row returns zero rows, and a
client attempt to write `version` is rejected.
**Depends on:** T04
**Refs:** sysdesign 3

---

## S2 Shell

### T06 Scaffold the Next.js app
App Router, TypeScript, Tailwind v4. Self-host Chakra Petch, Barlow, and JetBrains
Mono with `next/font/google`.
**Done when:** `next build` passes and the three faces render offline.
**Refs:** sysdesign 10

### T07 Encode the design tokens
Turn design.md section 2 into one `@theme` block in `globals.css`. Add the
`data-type` and `data-valence` rules that set `--hue` and `--hue-text`.
**Done when:** a test page paints a Self, Mythos, and Noise chip without any
component writing a hex.
**Refs:** design.md 2, sysdesign 10

### T08 Wire the Supabase browser and server clients
Use `@supabase/ssr`. Session in an httpOnly cookie, refreshed in `proxy.ts`.
Port the household-inventory wiring and drop the membership check.
**Done when:** a server component reads the session and a browser client reads its
own rows.
**Depends on:** T03
**Refs:** sysdesign 5

### T09 Sign-in and callback routes
`/login` and `/auth/callback`. Every route except `/s/[token]` redirects an
anonymous visitor to sign-in.
**Done when:** signing in lands on the roster, and signing out returns to `/login`.
**Depends on:** T08
**Refs:** PRD 7.11

### T10 Define the character document type
TypeScript types for the whole document: character, theme, tag, loadout, ghost
memory, status, story tag. Every tag carries its own id, assigned at creation.
Include `schema_version`.
**Done when:** the type compiles and a hand-written sample of the owner's real
character type-checks.
**Refs:** sysdesign 2

### T11 Document migration on read
`migrate(doc)` upgrades an older `schema_version` in code. Version 1 is a
pass-through, so the seam exists before it is needed.
**Done when:** a document one version behind loads without error.
**Depends on:** T10
**Refs:** sysdesign 2

### T12 Roster screen
Server component at `/`. List the user's characters from the generated columns
only, sorted by last edit. Never download a document here.
**Done when:** the roster renders names and Essences, and the network tab shows no
`data` column.
**Depends on:** T09, T05
**Refs:** PRD 7.2, design.md Roster

### T13 Character CRUD
Create, rename, duplicate, and delete. Duplicate copies the document and clears
the share token.
**Done when:** each of the four actions works from the roster.
**Depends on:** T12
**Refs:** PRD 7.2

### T14 Character state provider
One `useReducer` per open character in the `/c/[id]` layout. Reducer actions are
domain verbs. Every dispatch replaces the document in memory and writes it to
`localStorage`.
**Done when:** a dispatch updates the screen and survives a page reload with no
network.
**Depends on:** T10
**Refs:** sysdesign 8

### T15 Autosave and the version conflict prompt
Debounce about 800 ms. Flush on `pagehide` and `visibilitychange`. Every save
carries the last-read version. Zero rows updated opens a dialog asking which
document to keep. Never discard an edit to resolve a conflict.
**Done when:** two browser tabs editing one character produce the prompt, and both
documents are readable in it.
**Depends on:** T14
**Refs:** sysdesign 3, sysdesign 8

---

## S3 Rules engine

All of `lib/rules/` is pure. No React, no Supabase, no I/O. Tests run under
`node --test`, no framework and no fixtures.

### T16 constants.ts
Hold every number the PRD left open: decay track length, starting loadout Power,
starting tag counts, the default burn value of 3.
**Done when:** answering an open question is a one-line edit here.
**Depends on:** T01
**Refs:** sysdesign 7

### T17 power(selection)
Return a breakdown as a list of labelled values plus the total, never a bare
number. Positive tag +1, negative tag -1. Only the highest positive status tier
and the highest negative status tier count. A burnt tag reads its own burn value.
Support the manual modifier and rolling with a theme type.
**Done when:** tests cover an outranked status excluded from the total, a burn at
4 and at 5, and a roll with Self.
**Depends on:** T02, T16
**Refs:** PRD 7.8

### T18 raiseStatus and lowerStatus
Stacking marks the new tier, and marks one tier higher while the target is
already marked. Removal moves every mark one box left per tier, and erases a mark
pushed below tier 1.
**Done when:** tests cover stacking past an occupied tier, a cascade of two, and
removal that erases a tier 1 mark.
**Refs:** PRD 6, PRD 7.7

### T19 essenceCandidates and loadoutSpend
`essenceCandidates(themes)` maps the theme mix to one Essence or to the
Avatar/Conduit pair. `loadoutSpend(loadout)` totals 1P per loadout tag and 2P per
wildcard tag, and reports the over-budget warning as a sentence.
**Done when:** tests cover all eight mixes and an over-budget loadout.
**Depends on:** T16
**Refs:** PRD 7.5, PRD 7.6

### T20 readiness(character)
Return a list of sentences naming what is missing: a theme without a title tag, a
theme without a weakness tag, a missing Identity line, an unchosen Essence, an
over-budget loadout, more than four themes.
**Done when:** a half-built character returns the right sentences and a complete
one returns an empty list.
**Depends on:** T19
**Refs:** PRD 7.1

---

## S4 Sheet

### T21 Character layout and bottom bar
The `/c/[id]` layout loads the document once and owns the tab bar. Tabs are
`<Link>` routes with `aria-current="page"`. The centre key is the roll, labelled
with the live Power total.
**Done when:** switching tabs refetches nothing and the phone back button works.
**Depends on:** T14
**Refs:** sysdesign 9, design.md 4

### T22 Main sheet screen
Four theme cards. Each card carries `data-type`, so every chip inside inherits the
hue. Show the title tag in capitals, the tags, and both tracks.
**Done when:** the screen matches the Main artboard.
**Depends on:** T21, T07
**Refs:** PRD 7.3, design.md Main

### T23 Theme screen
One theme, open for editing. Tag list with question letters, the Identity, Ritual,
or Itch line labelled by theme type, and the two tracks.
**Done when:** the screen matches the Theme artboard.
**Depends on:** T22
**Refs:** PRD 7.3, design.md Theme

### T24 Add, edit, and delete tags
Power tags and weakness tags. Each tag records its themebook, its question letter,
and its own id. A question may be answered again at any time, and no screen treats
a question as consumed.
**Done when:** one theme holds two tags marked `B` and each edits independently.
**Depends on:** T23
**Refs:** PRD 7.3, sysdesign 2

### T25 Reorder tags
Move-up and move-down buttons. No drag and drop.
**Done when:** a tag moves both ways with touch and with a screen reader.
**Depends on:** T24
**Refs:** PRD 7.3, sysdesign 10

### T26 Burn and un-burn a tag
A burnt tag paints achromatic everywhere it appears. A dialog takes the burn
value, defaulting to 3, because theme specials change it.
**Done when:** a burnt tag reads as burnt on the sheet, the theme screen, and the
roll builder, and its value reaches `power`.
**Depends on:** T24, T17
**Refs:** PRD 7.3, PRD 7.8

### T27 Upgrade and Decay tracks
Checkbox boxes on both tracks. At 3 Upgrade points, clear the track and open the
Upgrade dialog: take a new power tag or a theme special.
**Done when:** marking the third box opens the dialog and either choice applies.
**Depends on:** T23
**Refs:** PRD 7.3

### T28 Themebook picker
A route, not an overlay. List the themebooks of the chosen type with their
concepts. Allow a typed-in name for a homebrew themebook.
**Done when:** picking a themebook returns to the theme screen with it set.
**Depends on:** T23, T33
**Refs:** PRD 7.3, sysdesign 10

### T29 Question picker
A route listing the themebook's questions, A to J for power and A to D for
weakness. Already-answered questions stay offered. A special may send the player
to another themebook's questions.
**Done when:** a tag records the themebook it borrowed a question from.
**Depends on:** T24, T33
**Refs:** PRD 7.3

### T30 Theme specials picker
A route listing that themebook's five specials, each with its rule text.
**Done when:** a chosen special shows on the theme card.
**Depends on:** T28
**Refs:** PRD 7.3

### T31 Essence
Suggest the Essence, or the Avatar/Conduit pair, from the theme mix. The player
confirms. Re-suggest when the mix changes, and never overwrite the choice
silently. Hold one free-text Essence special.
**Done when:** changing a theme type re-suggests without clearing the choice.
**Depends on:** T19, T22
**Refs:** PRD 7.5

### T32 Loadout screen
Move themes in and out. Loadout tag sets grouped per theme, each with a flaw.
Wildcard tags and misc flaws. Spent Power against available Power, with the
over-budget warning as a sentence. The loadout Upgrade track, and its own Upgrade
prompt: 1 more available Power or a loadout special.
**Done when:** the screen matches the Loadout artboard and the budget math agrees
with `loadoutSpend`.
**Depends on:** T19, T21
**Refs:** PRD 7.6, design.md Loadout

---

## S5 Content pack

### T33 Fallback content
`lib/content/fallback.ts` holds the 14 themebook names, their types, and the
question letters. Every text slot renders empty, and a tag editor shows
"power tag question B" over a blank field.
**Done when:** the app runs with no content pack row and no screen breaks.
**Refs:** sysdesign 6

### T34 Load and cache the pack
Fetch the `themebooks` row once and cache it in `localStorage`, keyed by
`updated_at`. A refilled pack changes the key and every device refetches.
**Done when:** a second page load makes no pack request, and changing the row
forces one.
**Depends on:** T33, T05
**Refs:** sysdesign 6

### T35 Upload script
`scripts/upload-pack.ts` writes `content/themebooks.json` into the row, using the
service role key from the local environment. The file stays out of git.
**Done when:** running the script fills every slot in the app.
**Depends on:** T04
**Refs:** sysdesign 6

---

## S6 Creation

### T36 Guided creation flow
`/c/[id]/create`, ten steps in the book's order. Every step saves, and a
half-built character reopens where the player left it. An experienced player skips
the flow and edits a blank sheet.
**Done when:** a new player builds a character with no rulebook open for the steps.
**Depends on:** T31, T32, T34
**Refs:** PRD 7.1, design.md Create

### T37 Readiness check
Show `readiness` output before the first session, and on the desktop sheet. Report
what is missing. Never block play.
**Done when:** a half-built character lists its gaps as sentences.
**Depends on:** T20, T36
**Refs:** PRD 7.1, design.md 4

### T38 Crew relationships
Add, edit, and delete a crew member and their relationship tag. Offer the three
scenarios from the chosen themebook and the relationship tag each suggests.
**Done when:** a relationship saves with the scenario that suggested it.
**Depends on:** T34
**Refs:** PRD 6, PRD 7.2

---

## S7 Play

### T39 Statuses
Add a status with a name, type, and starting tier. Raise and lower by a tier,
applying the stacking and removal rules. Delete a status, mark it as the MC's, and
mark it out.
**Done when:** the screen matches the Play artboard and every change takes one tap.
**Depends on:** T18, T21
**Refs:** PRD 7.7, design.md Play

### T40 Story tags
Add, scratch, and delete an ongoing story tag, positive or negative.
**Done when:** a scratched tag reads as scratched and stops counting in a roll.
**Depends on:** T39
**Refs:** PRD 7.7

### T41 Roll builder
Select the tags and statuses that apply. No effect is asked for. Print the
breakdown above the total. Show an outranked status selected and struck through.
Support the manual modifier and rolling with a theme type. Selection is throwaway
state in the layout provider, never saved.
**Done when:** the screen matches the Roll artboard and the total agrees with
`power`.
**Depends on:** T17, T40
**Refs:** PRD 7.8, design.md Roll

### T42 Reference screen
Port the CHEATSHEET tab: effect costs, mitigation costs, the Scale table, making a
roll, and the Power options. Read-only, with one search field filtering the list.
Empty content-pack slots stay visible.
**Done when:** a player reads an effect cost without losing their roll selection.
**Depends on:** T34
**Refs:** PRD 7.10, design.md Reference

### T43 Desktop layout
At `lg:`, render sheet, play, and roll as three panes and drop the tab bar. CSS
decides. No second set of components.
**Done when:** the 1440x900 view matches the Desktop artboard and the phone view is
unchanged.
**Depends on:** T41
**Refs:** design.md Desktop, sysdesign 9

---

## S8 Share and export

### T44 Migration: shared_character function
The `security definer` function, with execute revoked from `public` and granted to
`anon` and `authenticated`.
**Done when:** an anonymous call with a valid token returns the document, and an
invalid token returns nothing.
**Depends on:** T05
**Refs:** sysdesign 4

### T45 Generate and revoke a share link
Write a v4 UUID into `share_token`, and null it to revoke. Re-sharing generates a
new token, so an old link dies.
**Done when:** a revoked link stops working and a new one works.
**Depends on:** T44
**Refs:** PRD 7.11

### T46 Share page
`/s/[token]`, a server component that calls the function and renders read-only
HTML. No editor bundle, no Supabase client, no write path. It renders tags,
question letters, tracks, and statuses, and never renders content-pack text.
**Done when:** the page opens on a phone with no account, and the bundle carries no
Supabase client.
**Depends on:** T45
**Refs:** PRD 7.11, sysdesign 4

### T47 Export and import
Export the document to a file. Import validates it in TypeScript, runs `migrate`,
and inserts it as a new character.
**Done when:** an exported character imports back identically.
**Depends on:** T11
**Refs:** PRD 7.12

---

## S9 Offline

### T48 PWA manifest and icons
Installable on a phone. Use the 23 icons already drawn in the artboards, pasted as
SVG or taken from `lucide-react`.
**Done when:** the app installs to a phone home screen.
**Refs:** sysdesign 10

### T49 Service worker
Cache the app shell and the content pack.
**Done when:** the app opens with the network disabled.
**Depends on:** T48, T34
**Refs:** sysdesign 8

### T50 Retry a dirty save
A dirty document retries its save on the `online` event.
**Done when:** edits made with the network off reach the database when it returns.
**Depends on:** T15, T49
**Refs:** PRD 7.13

### T51 Keepalive cron
One Vercel cron, daily, calling a route that runs `select 1`. A free Supabase
project pauses after seven days, and a fortnightly campaign hits that.
**Done when:** the cron runs on a schedule and the project stays awake.
**Refs:** sysdesign 11

---

## S10 Later

### T52 Dice roller
Roll 2d6, add Power, and report 10+, 7-9, or 6-. Snake eyes always misses and
boxcars always hits strongly. Keep a per-session roll log.
**Done when:** tests cover both fixed results.
**Depends on:** T41
**Refs:** PRD 7.9

### T53 Undo
A 20-deep stack of previous documents.
**Done when:** the last edit reverses on every screen.
**Depends on:** T14
**Refs:** PRD 7.2

### T54 Lose a theme
One action, callable at any time on the player's command. It never depends on the
Decay track. Archive the theme whole into Ghost Memories, with when and why it was
lost.
**Done when:** a lost theme reads back complete, tags and track marks included.
**Depends on:** T23
**Refs:** PRD 7.4

### T55 Decay warning and replacement
Warn when a Decay track fills, and offer to lose that theme. Never lose it
automatically. A replacement starts nascent, except for a Nexus that stays a Nexus
and for a Conduit.
**Done when:** a filled track warns, and a Conduit's replacement starts full.
**Depends on:** T54
**Refs:** PRD 7.4

### T56 Evolution boxes and respec
Mark and clear the fixed Evolution list. Respec rebuilds every theme and keeps the
name, appearance, background, and crew relationships. Archive every replaced theme.
**Done when:** a respec leaves the identity fields untouched and Ghost Memories
holds the old themes.
**Depends on:** T54
**Refs:** PRD 7.4
