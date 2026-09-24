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

### T53 Undo - won't do
### T54 Lose a theme — done
### T55 Decay warning and replacement — done
### T56 Evolution boxes and respec - done
