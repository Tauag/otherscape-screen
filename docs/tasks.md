# Metro:Otherscape Character Sheet — Task list

Status: draft v1
Owner: Gavin Li
Related: [PRD.md](./PRD.md) (what and why), [system-design.md](./system-design.md)
(technical decisions), [design.md](./design.md) (interface)

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

## S7 Play - done

### T39 Statuses - done
### T40 Story tags - done
### T41 Roll builder - done
### T42 Reference screen - done
### T43 Desktop play board - done
### T43b Desktop editor routes - done
### T60 Desktop roster - done
### T61 Desktop share view - done

---

## S8 Share and export

### T44 Migration: shared_character function - done
### T45 Generate and revoke a share link - done
### T46 Share page - done
### T47 Export and import - done

---

## S9 Offline

### T48 PWA manifest and icons - done
### T49 Service worker - done
### T50 Retry a dirty save - done
### T51 Keepalive cron - done

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

### T53 Undo - won't do
### T54 Lose a theme — done
### T55 Decay warning and replacement — done
### T56 Evolution boxes and respec - done

---

## S11 Campaign

Artboards for T64-T67: https://claude.ai/artifact/4eMZSG3dhASSRs3yA2wiL2
(design.md 8). Match them.

### T62 Migration: campaigns and campaign_characters - done
Add `campaigns`, `campaign_characters`, the `campaigns_bump_version` trigger,
RLS, and column grants, all admin-only via `current_user_is_admin()`.
**Done when:** a non-admin select against `campaigns` returns zero rows and a
non-admin insert fails.
**Refs:** sysdesign 3

### T63 Campaign types, defaults, and reducer - done
Define the `Campaign` and `Npc` types (reusing `StoryTag` and `Status`
unchanged), a `migrate(doc)` function, an empty-campaign default, and a pure
reducer for every campaign action. Cover it with `node:test` tests, matching
`lib/character/__tests__`.
**Done when:** tests pass for every reducer action, including an NPC's story
tags and statuses.
**Refs:** sysdesign 3, sysdesign 14

### T64 Campaign list - done
Build `/admin/campaigns`: list campaigns, create one, delete one with
confirmation. Link to it from `/admin`.
**Done when:** an admin creates, sees, and deletes a campaign; a signed-in
non-admin gets a 404.
**Depends on:** T62, T63
**Refs:** PRD 7.14, design.md 8.1, sysdesign 9, canvas: Campaign list, Delete campaign

### T65 Campaign story tags with autosave - done
Build the story tags section of `/admin/campaigns/[id]`: create, rename, set
valence, burn, mark crispy, delete. Wire autosave per sysdesign 14.
**Done when:** editing a campaign's story tags saves automatically and
survives a reload.
**Depends on:** T64
**Refs:** PRD 7.14, design.md 8.2, sysdesign 14, canvas: Campaign screen

### T66 NPCs with story tags and statuses
Add the NPCs section: create, edit, delete an NPC; within it, the same story
tag actions as T65 plus mark and clear a status tier.
**Done when:** a new NPC's story tag and status both persist after a reload.
**Depends on:** T65
**Refs:** PRD 7.14, design.md 8.2, sysdesign 3, canvas: Campaign screen

### T67 Assign characters and read-only view
Add the assigned characters section (a picker of every character, add and
remove, as server actions on `campaign_characters`) and
`/admin/campaigns/[id]/characters/[characterId]`, reusing
`components/share-sheet.tsx`, with a link to the real editor.
**Done when:** an admin assigns a character, opens its read-only view, and
removes it from the campaign.
**Depends on:** T64
**Refs:** PRD 7.14, design.md 8.2, design.md 8.3, sysdesign 9, canvas: Campaign screen, Assign characters, Character view
