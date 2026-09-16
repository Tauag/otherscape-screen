# Metro:Otherscape Character Sheet — PRD

Status: draft v1
Owner: Gavin Li
Related: [system-design.md](./system-design.md) (technical decisions), [design.md](./design.md) (interface),
[tasks.md](./tasks.md) (build order)

This document states what the product does and why. It states no technical or
interface decisions. Those get workshopped separately.

## 1. Problem

The campaign runs on a Google Sheets character sheet. The sheet is complete and
rules-accurate, but it fails at the table:

- Mobile Sheets forces pinch-zoom on a 68-column grid. Tapping a checkbox is slow.
- Play state (statuses, burnt tags, Upgrade marks) changes every few minutes. The
  sheet makes each change a multi-tap chore.
- Power math is manual. Players count tags out loud and make errors.
- The layout is fixed. Adding a status card or a fifth theme means editing formulas.

Players need the sheet on a phone during play and on a desktop during prep.

## 2. Goals

1. Edit a full character comfortably on a phone.
2. Change in-session state fast enough that play does not pause.
3. Compute Power for a roll from the tags and statuses the player selects.
4. Keep every rules reference the sheet holds, available without leaving the app.
5. Cost $0/month to run.

## 3. Non-goals for v1

- GM tools (NPC sheets, GM-owned story tags, campaign management). See section 10.
- Crew sheet. It lands with the GM tools.
- Real-time multiplayer editing.
- Native mobile apps.
- Publishing themebook text to people outside the table. Whether the content pack
  carries the rulebook's wording is decided after v1, not built into the app.
- Virtual tabletop integration (Foundry, Roll20).
- A separate sub-sheet for Companion and Drones secondary characters. Their tags
  and statuses live in the same places as the PC's. The table remembers which ones
  belong to the companion. That costs a little bookkeeping and saves a whole
  parallel sheet.
- A Google Sheets importer. Existing characters get re-entered by hand, once.

## 4. Locked decisions

| Decision | Choice |
|---|---|
| V1 scope | Sheet editing plus live play state |
| Rules handling | Compute and warn, never block |
| Sharing | Private by default, read-only share link per character |
| Themebook content | A content pack: the app reads themebooks from a data file |
| Dice | Optional roller, P1. Players may keep physical dice |

**The content pack** holds the 14 themebooks and their shape: name, type, the 10
power tag questions, the 4 weakness tag questions, the 3 crew relationship
scenarios, and the 5 theme specials. Each entry has a slot for the question's text
and the special's rule text. Filling those slots is a deployment choice, made after
v1 ships. The app works either way: with the slots empty it shows "power tag
question B" and a blank field, and with them filled it shows the question itself.
Nothing in the app hard-codes a themebook.

**Optimize for frequency.** Marking a status and counting Power happen constantly,
so they stay fast. Rare events may cost extra steps: overriding a burn from 3 to 4,
losing a theme, replacing a theme. Correctness matters more than speed there.

**Compute and warn** means the app calculates Power, Essence, and the loadout
budget, and flags an illegal state with a visible warning. It never refuses the
edit. The MC overrules the book often enough that hard blocks would get in the way.

## 5. Users

| User | Device | Needs |
|---|---|---|
| Player, in session | Phone | Fast status edits, tag selection, Power total |
| Player, between sessions | Desktop | Build and revise themes, write tags, plan loadout |
| Friend or MC, invited | Either | Read a shared sheet, no edits |

## 6. Domain model

Derived from the existing sheet (tabs: PC SHEET, LOADOUT SETS, TEMPLATES, CHEATSHEET).

### Character
- Character name, player name
- Appearance (short text)
- Background data (long text)
- Crew relationships: list of (crew member name, relationship tag)
- Essence: one of eight, set by the Self / Mythos / Noise balance of the themes:

  | Essence | Theme mix |
  |---|---|
  | Real | Self only |
  | Avatar | Mythos only |
  | Conduit | Mythos only |
  | Singularity | Noise only |
  | Spiritualist | Self and Mythos |
  | Cyborg | Self and Noise |
  | Transhuman | Mythos and Noise |
  | Nexus | All three types |

  The mix narrows the choice. The player makes it. Avatar and Conduit share a mix,
  so the app offers both and the player picks. The book splits them on whether the
  Mythos themes draw on one Source or several, which the player already knows. The
  app does not track Sources. Essence changes when the character replaces themes.
  Once the mix narrows to exactly one Essence and the character holds all 4
  starting themes, the app assigns it automatically. A tied mix, or an Essence
  the player already chose, is left alone; the player can still pick or override
  one at any time.
- Essence special: every character has exactly one, set by their Essence. It works
  like a theme special. The app names the Essence. The player writes the special's
  text, because that text belongs to the rulebook.
- Veteran specials: up to 3 (text)
- Evolution checkboxes, fixed list:
  - Create a new type of Essence
  - Create another broad power tag
  - Gain a Veteran Special (x3)
  - Ride off into the sunset (Retirement)
  - Sunder the cosmology (Narrative development)
  - Total Reconstitution (Respec)
- Ghost memories: an archive of lost themes. Each entry keeps a full snapshot of
  the theme as it stood when the character lost it: themebook, type, title tag,
  every power and weakness tag, the Identity, Ritual, or Itch, the specials, and
  the track marks. It also records when the theme was lost and why. Players read
  these back later. The sheet keeps only themebook, type, and title tag, which
  loses the rest.
- Themes: 4, not counting the loadout or the crew theme. The app hides the
  add-theme control once a character holds 4 (see 7.3). A character that
  already held more than 4 before this cap keeps its extra themes, with a
  warning instead of a block.
- Loadout: see below
- Play state: statuses and story tags

### Theme
- Type: Mythos, Self, or Noise
- Themebook, chosen from the themebooks of the theme's type:

  | Type | Themebooks |
  |---|---|
  | Self | Affiliation, Assets, Expertise, Horizon, Personality, Troubled Past |
  | Mythos | Artifact, Companion, Esoterica, Exposure |
  | Noise | Augmentation, Cutting Edge, Cyberspace, Drones |

  Every themebook has the same shape: a concept, one opening question, 10 power tag
  questions (A to J), 4 weakness tag questions (A to D), guidance for the
  Identity, Ritual, or Itch, 3 crew relationship scenarios each with a suggested
  relationship tag, and 5 theme specials. Allow a typed-in name for a homebrew
  themebook.
- Title tag: the first power tag that answers question A. Every theme has one. The
  sheet renders it in capitals. A later answer to A is a normal power tag.
- Nascent flag. A nascent theme hides its locked rows and shows fewer tags.
- Upgrade track: 3 points. Decay track: 3 boxes.
- Starting size: 3 power tags, the title tag included, and 1 weakness tag. One
  theme may instead take 4 power tags and 2 weakness tags; the player chooses
  which theme.
- Power tags: ordered list of (themebook, question letter, text, burnt flag). Each
  power tag answers a themebook question, labelled A to J. Question A is always
  answered. The player chooses which others to answer, and may answer a question
  again at any time. One question can carry several tags. The answer is the tag. A tag
  usually cites its own theme's themebook, but several theme specials let a tag
  answer a question from a named other themebook, so the tag records which
  themebook the question came from.
- Weakness tags: ordered list of (question letter, text). Weakness questions are
  labelled A to D and follow the same rule, repeat answers included.
- Identity, Ritual, or Itch. One quote line, named by theme type:
  Mythos uses Ritual, Self uses Identity, Noise uses Itch.
- Theme specials: chosen from that themebook's five. Some change rules the app
  computes. Burning a tag can add 4 or 5 Power instead of 3, a miss can mark an
  Upgrade box, and one special marks Decay on another theme in place of burning.

### Loadout
The loadout is itself a theme. It carries its own Upgrade track of 3 points, and
it has no Decay track.

- Which themes sit in the loadout
- Loadout tag sets, grouped per loadout theme, each with a flaw
- Misc / wildcard loadout tags, and misc loadout flaws
- Loadout theme specials
- Available loadout Power: a budget, tracked for reference rather than
  enforced. A loadout tag costs 1P, a wildcard tag 2P. It starts at 1 and
  grows as the loadout theme upgrades. In-session actions can let the player
  load past it, so the app computes and warns, never blocks.

### Status (tracking card)
- Name
- Written as name-tier, for example exhausted-2 or amped-up-2. The rulebook and the
  themebooks both use this shorthand.
- Tier marks, 1 to 6, each box marked or not
- Type: positive or negative
- Owner flag: mine, or MC. Plus an "out" flag for a spent card.
- Stacking rule: mark the new tier. If that tier is already marked, mark one
  tier higher, and repeat.
- Removal rule: move all marked tiers one box left per tier removed. A mark
  pushed below tier 1 is erased.

### Story tag
- Name, positive or negative, scratched flag.

## 7. Requirements

Priority: P0 ships in v1. P1 is next. P2 is a maybe.

### 7.1 Character creation — P0
A guided flow that follows the book's order. Every step saves. A half-built
character reopens where the player left it. An experienced player skips the flow
and edits a blank sheet directly.

1. Name the character and the player.
2. Choose the type of each starting theme: Mythos, Self, or Noise.
3. Choose a themebook for each theme, offering only themebooks of that theme's type.
4. Answer question A for each theme. That answer becomes the theme's title tag.
5. Answer further power tag questions, and at least one weakness question, per theme.
   A question may be answered more than once. Starting size is 3 power tags
   (the title tag counts as one) and 1 weakness tag per theme, except one
   theme the player may build with 4 power tags and 2 weakness tags instead.
6. Write the Identity, Ritual, or Itch line for each theme.
7. Choose the Essence from the candidates the theme mix allows.
8. Build the starting loadout inside the starting Power budget.
9. Write a relationship tag for each other crew member, offering the three
   scenarios from the chosen themebook and the relationship tag each suggests.
   The other player approves the relationship they are cast in.
10. Write appearance and background. Both are optional.

- Run a readiness check before the first session. Report what is missing: a theme
  without a title tag, a theme without a weakness tag, a missing Identity line, an
  unchosen Essence, an over-budget loadout. Report it. Never block play.

### 7.2 Character CRUD — P0
- Create, rename, duplicate, and delete a character.
- List all of the user's characters, sorted by last edit.
- Save every edit automatically. A player never loses work by closing the app.
- Add, edit, and delete crew relationships, each a crew member and a relationship tag.
- Undo the last edit (P1).

### 7.3 Themes — P0
- Add a theme, choose its type, then choose its themebook from the themebooks of
  that type. Allow a typed-in name for a homebrew themebook.
- Choose theme specials from that themebook's five.
- Record which themebook and which question letter a power tag answers, including
  when a special sends the player to another themebook's question.
- Let a question take another answer at any time. Never retire an answered question
  or cap a theme's tags at the question count.
- Add, edit, reorder, and delete power tags and weakness tags.
- Mark and clear boxes on the Upgrade and Decay tracks.
- Mark an Upgrade point when the player uses one of that theme's weakness tags.
- At 3 points, clear the track and prompt for the Upgrade. The player takes either
  a new power tag, answering any themebook question including one already answered,
  or a theme special.
- Toggle a theme to nascent.
- Edit the Identity, Ritual, or Itch line. Label it by the theme's type.
- Cap a character at 4 themes: hide the add-theme control once it holds 4. A
  character that already held more than 4 before this cap keeps them, with a
  warning instead of a block.
- Burn a power tag, and un-burn it. A burnt tag shows as burnt everywhere.

### 7.4 Losing and replacing themes — P1
Losing a theme is one action with many triggers. Build the action first, then the
triggers that call it.

- Lose a theme at any time, on the player's command. A filled Decay track is only
  the most common trigger. Going Out In A Blaze, an Avatar defying their Agenda, a
  Conduit replacing a theme at will, and several theme specials all lose a theme
  too, so the action never depends on the Decay track.
- Archive the lost theme into Ghost Memories, snapshotting it whole, and record why
  it was lost.
- Warn when a Decay track fills, and offer to lose that theme. Do not lose it
  automatically. The table decides when it happens.
- Replace a lost theme. The replacement starts nascent. Two Essences override this:
  a Nexus that stays a Nexus after the change, and a Conduit. Both gain a full theme.
- Mark and clear the Evolution boxes.
- Respec the character, rebuilding every theme while keeping the name, appearance,
  background, and crew relationships. Archive every replaced theme.

### 7.5 Essence — P0
- Suggest the Essence, or the pair of candidates, from the current theme mix.
- The player confirms or overrides the suggestion at any time.
- Once the mix narrows to exactly one Essence and the character holds all 4
  starting themes, assign it automatically. A tied mix, or an Essence the
  player already chose, is left alone.
- Re-suggest when the theme mix changes. Never overwrite the player's choice silently.
- Hold one free-text Essence special.

### 7.6 Loadout — P0
- Move a theme in and out of the loadout.
- Load Up and Load Off: rebuild the loadout tag selection inside the Power budget.
- Move a tag between the loadout theme and a regular theme, which some theme
  specials require.
- Add loadout tag sets, wildcard tags, and flaws.
- Show spent Power against available Power. 1P per loadout tag, 2P per wildcard tag.
- Warn when the loadout is over budget.
- Mark an Upgrade point on the loadout theme when the player uses a loadout flaw.
- At 3 points, clear the track and prompt for the Upgrade. The player takes either
  1 more available loadout Power or a loadout theme special.

### 7.7 Play state — P0
This is what a player uses while a session runs.
- Add a status. Set its name, type, and starting tier.
- Raise a status by a tier, applying the stacking rule automatically.
- Lower a status by a tier, applying the removal rule automatically.
- Delete a status. Mark it as the MC's.
- Add, scratch, and delete ongoing story tags.
- A player changes any status or story tag without losing sight of their tags.
- Play actions are quick enough to do mid-conversation, without interrupting the table.

### 7.8 Roll builder — P0
- Select the tags and statuses that apply to the action. Do not ask for an effect.
  One action can land several effects at once, and the player chooses them after
  the roll, when they spend the Power. The builder totals an action, nothing more.
- Compute Power: each relevant positive tag adds 1, each negative tag subtracts 1.
  Only the highest positive status tier and the highest negative status tier count.
  A burnt power tag contributes 3 instead of 1. Theme specials change that number,
  so treat 3 as the default and let the player set it per burn.
- Support rolling with Self, Mythos, or Noise: when the action is generally
  about that domain, Power comes from the count of themes of that type instead
  of the counted tags. Negative tags and statuses still count, and the player
  cannot burn a tag for Power on that roll. Several Essence specials grant this.
- Allow a manual modifier for the Scale gap and for MC calls.
- The running Power total stays visible while the player builds the roll.
- Do not save rolls. A roll is thrown away once it is made. The sheet's four TAG
  COMBO slots exist because paper cannot recompute; the app recomputes instantly.

### 7.9 Dice roller — P1
- Roll 2d6, add Power, and show strong hit (10+), mixed hit (7-9), or miss (6-).
- Apply the fixed results: snake eyes always misses, boxcars always hits strongly.
- Keep a per-session roll log.

### 7.10 Reference — P0
Port the CHEATSHEET tab. A player reads it during play without losing their current
state. The reference is read-only. It never selects anything for a roll. A player
reads the effect costs here after the roll, when they decide how to spend Power.
- Effects and their costs: Attack, Disrupt, Influence, Weaken, Bestow, Create,
  Enhance, Restore, Advance, Set Back, Discover, Extra Feat.
- Mitigation costs.
- The Scale table.
- Making a roll, choosing Effects, and the Rule of Minimum One.
- Power options: burning a tag, pushing a 10+, Going Out In a Blaze.

### 7.11 Account and sharing — P0
- A player signs in with an account they already have. No new password to remember.
- A character is private to its owner. Nobody else reads or edits it by default.
- The owner generates a read-only link for a character, and revokes it later.
- Opening a share link requires no account and grants no edit rights.

### 7.12 Import and export — P1
- Export a character to a file, and import that file back. The player owns their
  data and can leave with it.
- Export a printable character document, matching the sheet's print-out block (P2).

### 7.13 Offline — P1
- A player keeps editing when the venue's wifi drops.
- No edit made offline is lost once the connection returns.

## 8. Milestones

| Milestone | Contents | Done when |
|---|---|---|
| M1 Skeleton | Auth, character list, empty sheet, autosave | You can log in and create a named character that persists |
| M2 Sheet | Themes, tags, tracks, Identity/Ritual/Itch, Essence, loadout | You can re-enter your real character fully |
| M2.5 Creation | Guided creation flow, readiness check | A new player builds a character in the app, with no rulebook open for the steps |
| M3 Play | Statuses, story tags, roll builder, reference | You run one session from the phone without opening Sheets |
| M4 Share | Read-only links, export, offline editing | You send the MC a link and it opens on their phone |

Ship M3 before adding anything. Running one real session is the only test that
matters here.

## 9. Rules answers

Confirmed against the rulebook. O1 to O6 are closed.

- **O1. Rolling with Self, Mythos, or Noise.** Rulebook p.122. When an action is
  generally about one of the three domains (identifying or understanding a
  phenomenon of that type, or resisting a transformation of that type, are the
  common cases), the player may use the count of themes of that type as Power
  instead of counting tags. Negative tags and statuses still apply. The player
  cannot burn a tag for Power on that roll. The MC decides which actions
  qualify.
- **O2. Decay track length.** 3 boxes, the same length as the Upgrade track.
  Decay marks when a character acts against an Identity, neglects a Ritual, or
  suppresses an Itch, and a filled track loses the theme.
- **O3. Starting themes.** 4, always, not counting the loadout or the crew
  theme. The app caps a character at 4 themes total: the add-theme control
  disappears once it holds 4. No cap on how many share one type, or even one
  themebook: a player could take Assets four times over. The book advises
  against it but does not block it, so the app does not either.
- **O4. Starting tags.** 3 power tags per theme, the title tag included, and 1
  weakness tag. One theme may instead take 4 power tags and 2 weakness tags;
  the player chooses which theme gets the larger set.
- **O5. Starting loadout Power.** 1. It rises as the loadout theme upgrades,
  and in-session actions can let the player load a tag past the budget. Treat
  it as a tracked reference number, not a hard cap, per the "compute and warn"
  rule in section 4.
- **O6. Themebook list.** The 14 themebooks in section 6 are the complete set.

## 10. Later: GM tools

Recorded so v1 does not block them. Not in scope now.

- Crew sheet: crew theme, crew log, specific items, downtime options.
- NPC and threat sheets, built from the same theme and tag model.
- GM-owned story tags and statuses, shared into a session view.
- Campaign container that groups characters, NPCs, and story tags.

NPCs and the crew reuse the same theme and tag model as a player character. V1
should not make that harder to add later.
