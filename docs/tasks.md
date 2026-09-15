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
| S4.5 Design realignment | T58 | M2 |
| S5 Content pack | T33-T35 | M2 |
| S6 Creation | T36-T38 | M2.5 |
| S7 Play | T39-T43 | M3 |
| S8 Share and export | T44-T47 | M4 |
| S9 Offline | T48-T51 | M4 |
| S10 Later | T52-T57 | P1 |

---

## S0 Rules research — done

### T01 Answer open questions O2 to O6 — done
### T02 Answer O1, rolling with Self, Mythos, or Noise — done

---

## S1 Supabase — done

### T03 Create the Supabase project and enable Google auth — done
### T04 Migration: characters and content_packs — done
### T05 Migration: version trigger, RLS, and column grants — done

---

## S2 Shell — done

### T06 Scaffold the Next.js app — done
### T07 Encode the design tokens — done
### T08 Wire the Supabase browser and server clients — done
### T09 Sign-in and callback routes — done
### T10 Define the character document type — done
### T11 Document migration on read — done
### T12 Roster screen — done
### T13 Character CRUD — done
### T14 Character state provider — done
### T15 Autosave and the version conflict prompt — done

---

## S3 Rules engine — done

### T16 constants.ts — done
### T17 power(selection) — done
### T18 raiseStatus and lowerStatus — done
### T19 essenceCandidates and loadoutSpend — done
### T20 readiness(character) — done

---

## S4 Sheet — done

### T21 Character layout and bottom bar — done
### T22 Main sheet screen — done
### T23 Theme screen — done
### T24 Add, edit, and delete tags — done
### T25 Reorder tags — done
### T26 Burn and un-burn a tag — done
### T27 Upgrade and Decay tracks — done
### T28 Themebook picker — done
### T29 Question picker — done
### T30 Theme specials picker — done
### T31 Essence — done
### T32 Loadout screen — done

**Reopened by S4.5:** T21 to T23 closed without matching their artboards. T58
finishes that.

---

## S4.5 Design realignment — next

The number runs on from T57. The step sits here because every screen S6 and S7
add draws these pieces. Realigning later means realigning them in five more
screens.

### T58 Realign the built screens with the artboards
The tokens already match design.md sections 2 and 3. The drift is composition.
Five shared pieces first, because every later screen draws them:

1. **Chip.** A bordered pill: hue border, tinted fill, and the question letter as
   a mono badge. Today it is a list row with a left border.
2. **Track pips.** Small squares under `UPG` and `DEC`, lit when marked. Today
   both tracks are native checkboxes labelled in words. Keep the 44px hit target
   and the screen-reader text T27 gives them.
3. **Theme card.** A hue spine down the left edge, a `TYPE · THEMEBOOK` header row,
   the title carrying its hue glow, and the Identity, Ritual, or Itch line. A
   nascent theme keeps the dashed card.
4. **App bar.** Monogram, character name, the theme-mix rule, and the Essence.
   Name and player name move out of the scroll body into it.
5. **Tab bar.** Fixed to the bottom, icon above label, and the centre Roll key in
   primary pink. The key reads 0 until T41 builds a selection, because `power`
   takes a roll selection and nothing stores one yet. Keys for screens that do
   not exist stay out, per T21.

Then the roster card: the theme-mix bars and the statuses-in-play line. Both need
theme data the roster query does not select, so the row needs another generated
column. The document never travels to the roster.

**Done when:** the Main and Roster screens match their artboards at 390x844.
**Depends on:** T22, T32
**Refs:** design.md Main, design.md Roster, design.md 4

---

## S5 Content pack

### T33 Fallback content — done
`lib/content/fallback.ts` holds the 14 themebook names, their types, and the
question letters. Every text slot renders empty, and a tag editor shows
"power tag question B" over a blank field.
**Done when:** the app runs with no content pack row and no screen breaks.
**Refs:** sysdesign 6

### T34 Load and cache the pack — done
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
`/character/[id]/create`, ten steps in the book's order. Every step saves, and a
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

### T54 Lose a theme — done
One action, callable at any time on the player's command. It never depends on the
Decay track. Archive the theme whole into Ghost Memories, with when and why it was
lost.
**Done when:** a lost theme reads back complete, tags and track marks included.
**Depends on:** T23
**Refs:** PRD 7.4

### T55 Decay warning and replacement — done
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

### T57 Turn the roles sketch into real tickets
sysdesign 5 sketches admin roles: a `profiles` table, the role-aware
`own_characters` policy, and the JWT-claim optimization if the subquery ever
needs it. Break that sketch into scoped tickets here, the way this file
breaks down every other section.
**Done when:** the roles work has its own S11 with tickets a player could pick
up and build, each with a Done-when and its Refs.
**Refs:** sysdesign 5
