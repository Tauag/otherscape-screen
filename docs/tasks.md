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

---

## S4.5 Design realignment — done

### T58 Realign the built screens with the artboards - done
### T59 Fix the loadout page to align with game rules - done

---

## S5 Content pack - done

### T33 Fallback content — done
### T34 Load and cache the pack — done
### T35 Upload script - done

---

## S6 Creation - do not do

### T36 Guided creation flow
### T37 Readiness check
### T38 Crew relationships

---

## S7 Play

### T39 Statuses - done
### T40 Story tags - done
### T41 Roll builder - done
### T42 Reference screen - done

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
boxcars always hits strongly. Keep a per-session roll log. This is the first
point a roll is actually committed, so it is also where a crispy story tag in
the roll gets deleted (T40).
**Done when:** tests cover both fixed results, and a crispy tag in the roll is
gone afterward.
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
