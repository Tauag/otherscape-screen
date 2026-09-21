# Metro:Otherscape Character Sheet — Interface design

Status: draft v1
Owner: Gavin Li
Related: [PRD.md](./PRD.md) (what the product does and why),
[system-design.md](./system-design.md) (technical decisions)

The PRD states no interface decisions. This document holds them.

**The artboards live in the canvas, and nowhere else:**
https://claude.ai/code/artifact/1e55c96a-02c5-4710-8b68-4d936b153b8e

Open that link to read, edit, or export a screen. This document holds the
decisions; the canvas holds the pictures they describe.

## 1. Scope

Nine screens. They cover milestones M1 to M3, which is everything needed to run
one session from a phone, plus the desktop prep view.

| Artboard | Screen | PRD |
|---|---|---|
| Roster | Character list, with a half-built character to resume | 7.2, 7.11 |
| Main | The sheet: four theme cards | 7.3 |
| Theme | One theme, open for editing | 7.3 |
| Play | Statuses and story tags | 7.7 |
| Roll | Roll builder | 7.8 |
| Loadout | Loadout sets and the Power budget | 7.6 |
| Create | Guided creation, step 5 of 10 | 7.1 |
| Reference | Cheatsheet, read-only | 7.10 |
| Desktop | Sheet, play state, and roll builder at once, 1440x900 | 5 |

Phone artboards are 390x844. Hit targets are 44px or larger.

## 2. Colour

Colour carries meaning here and nothing else. Two axes, kept apart.

**Theme type.** Every tag inherits the hue of the theme it came from, so a tag's
origin reads without a label.

| Type | Base | Title tag | Tag text |
|---|---|---|---|
| Self | `#E85A5F` | `#F08287` | `#F0A9AC` |
| Mythos | `#9B6BF0` | `#B98FF7` | `#C9B4F5` |
| Noise | `#47D9E8` | `#6FE4F0` | `#A6ECF4` |

**Valence.** Statuses, story tags, weakness tags, and every warning.

| Meaning | Base | Text |
|---|---|---|
| Positive | `#5DE8A8` | `#93F0C6` |
| Negative, and every warning | `#E8A047` | `#F0C68C` |

Negative is amber, not red, because red is Self. A red weakness chip inside a red
Self card would be unreadable.

**Outside both axes.**

| Role | Colour | Reason |
|---|---|---|
| Burnt tag | `#C9C6DA` | Burning is a state, not an origin. It stays achromatic. |
| Primary action | `#FF2E88` | The app's own voice: Roll, New character, active tab. |

**Ground.**

| Role | Colour | Where |
|---|---|---|
| Background | `#0A0A0F` | the page |
| Surface | `#12121B` | a card |
| Border | `#232331` | a card's edge |
| Text | `#F0EEF8` | body copy |
| Dim text | `#8A87A0` | a secondary line |
| Faint label | `#5A5770` | a section label |
| Chrome | `#0D0D15` | app bar and tab bar |
| Chrome border | `#1D1D28` | the rule under the app bar, over the tab bar |
| Recessed surface | `#101018` | a nascent card, a dimmed roster card |
| Raised border | `#2A2A3A` | the border of a card that is in play |
| Empty pip border | `#3A3A4C` | an unlit track pip, a dashed edge |
| Muted | `#6E6B86` | an inactive tab key, a lit Decay pip |
| Quiet | `#9A97B0` | the monogram, the Identity/Ritual/Itch line |
| Hairline | `#1E1E2A` | the rule inside a roster card |
| Burnt badge fill | `#2E2E3E` | the badge on a burnt tag |

The three type hues are named after the Google Sheets original. The exact fills
are unconfirmed. Replace these hexes when the sheet's values are to hand.

## 3. Type

| Face | Use |
|---|---|
| Chakra Petch | Tags, titles, buttons, Power totals |
| Barlow | Body text, question text, Identity and Ritual lines |
| JetBrains Mono | Section labels, question letters, Power math |

Question letters ride on every tag: `B`, `A`, whichever the tag answers.
A tag always shows which themebook question it answers. A question can be answered
more than once, so two tags may carry the same letter.

## 4. Interface decisions

1. **Power is never a bare number.** Every number sits on the thing that produced
   it: a selected tag carries its own `+1`, an outranked status is struck through,
   and Rolling with shows its own contribution on the control. A player checks the
   app's arithmetic by reading the screen, not a printed sum.
2. **Outranked statuses stay visible.** `traced-1` sits selected and struck
   through, because only the highest tier each side counts. The app says so
   instead of silently dropping it.
3. **Warnings are sentences.** The over-budget loadout and the desktop readiness
   check say what is wrong in plain words. Neither blocks the edit.
4. **The bottom bar carries the live Power total.** It is a tab bar on every
   screen, and the centre key is the roll, labelled with the current total.
5. **Empty content-pack slots are visible, not hidden.** The Reference screen
   shows effect names with blank cost and rule slots. Filling the pack fills the
   screen.
6. **No fake status bar or keyboard.** The real ones render on top.

## 5. Desktop

The Desktop artboard in the canvas is stale. This section supersedes it. It is
designed from the play loop, not from the phone's screen boundaries.

### What the table actually does

| Step | How often | Screen today |
|---|---|---|
| Pick tags, read Power, roll | many times a scene | Roll |
| Mark or clear a status tier | many times a scene | Play |
| Create a story tag, spend a crispy one | many times a scene | Play |
| Burn a tag | several times a session | Roll |
| Mark Attention or Decay | several times a session | Sheet, Theme |
| Load or unload a set | a few times a session | Loadout |
| Write tag text, pick themebooks, spend Evolution | between sessions | Theme, pickers, Evolution |

Everything above the last row is one continuous activity: build a roll from what
is on the table, roll it, record what it cost. Those steps are split across three
phone screens because a phone can only show one thing. A desk can show all of it,
so the desktop puts that whole activity on **one board** and keeps the
between-session work as routes.

### The board

The board is the desktop home at `lg`. It fits 1440x900 without scrolling.

```
┌────────────────────────────────────────────────────────────────────────┐
│ ← HALCYON DRIFT  NEXUS      Board  Evolution  Ref    Saved         ⋮   │
├─────────────┬─────────────┬─────────────┬──────────────────────────────┤
│ self·Divided│ mythos·Relic│ noise·Cyber │  THE TABLE                   │
│ UPG ■■□ DEC■│ UPG ■□□ DEC□│ UPG □□□ DEC■│                              │
│ NADIA     +1│ THE NINTH   │ GHOSTWIRE   │  STATUSES          + status  │
│ talks…    +1│ opens…    +1│ rides…    +1│  traced-2      −2  ▣▣□□      │
│ pistol BURNT│ whispers…   │ nobody…     │  braced-1          ▣□□□      │
│ owes…       │             │             │                              │
├─────────────┼─────────────┼─────────────┤  STORY TAGS           + tag  │
│ (nascent)   │ Loadout 2/3 │ Crew        │  smoke cover       +1        │
│             │ Night Run…  │ The Long…   │  alarm rising                │
│ build this  │ grapple…    │ we all owe… │  the door is open    crispy  │
│ theme       │ bulky…      │ Maro · …    │                              │
├─────────────┴─────────────┴─────────────┴──────────────────────────────┤
│ MOD [−][0][+]  ROLLING WITH [None|Self +2|Mythos|Noise]  POWER +3 [ROLL]│
└────────────────────────────────────────────────────────────────────────┘
```

Three regions.

| Region | Holds | Why here |
|---|---|---|
| Panels | One panel per theme, plus loadout and crew. Each carries its Attention and Decay pips, its title tag and its tags, every one selectable | Tag selection is the most frequent act in the game, and a track is marked right after the roll that filled it |
| The table | Statuses and story tags: scene state, not yours | It changes every few minutes and belongs to the table, not to a theme |
| The dock | Modifier, rolling with, the Power total, Roll | Never scrolls and never moves, so the number a player reads out is always in the same place |

Layout: panels are a grid, three up at 1280 and above and two up below it. The
table is a 340px rail. The dock is a fixed 96px bar across the bottom.

**A panel grows to its tags.** A starting theme holds 3 power tags and 1 weakness;
Upgrades take it to 10 and 4. No panel scrolls and no row gets denser, because a
tag a player cannot see is a tag they will not use. The panel grid scrolls
instead, under a dock and a table rail that never move. A starting character fits
1440x900 with room left; a veteran scrolls, and the number they read out loud
stays put either way.

**The dock prints no breakdown.** Section 4 decision 1 is served by the board
itself: a selected tag shows its own `+1`, an outranked status strikes through,
and Rolling with carries its contribution on the control. A written sum beside
all of that would only restate the screen.

That last one matters. When a roll uses a domain, `power()` adds a line worth the
theme count that belongs to no tag, and every positive tag stops counting. So the
chosen segment reads `Self +2`, and the greyed-out tags around the board explain
themselves.

### The editors

Everything a player does between sessions stays a route, and a route takes the
full width when it opens: theme, loadout, crew, evolution, reference, and the
five pickers. The pencil on a board panel opens that panel's editor.

The sheet's card list has no desktop job left. The board shows the same themes,
arranged for what a player actually does with them.

### Chrome

| Element | At `lg` |
|---|---|
| Links | `Board Evolution Ref`. Play and Roll are gone as destinations because the board holds both |
| Power total | In the dock, at 46px, beside the Roll button |
| Save status | Leaves the bottom of the page and sits in the app bar |
| Tab bar | Gone |

The parked-copy sentence is long and rare, so it stays out of the bar. It renders
as a full-width strip under the app bar when a conflict leaves a copy behind.

### Decisions

1. **Every tag, status and story tag is drawn once.** Whatever shows a tag also
   selects it. Nothing on the board is a read-only copy of something else.
2. **A status carries both of its jobs.** The boxes set the tier, the row puts it
   in the roll. They are used in the same beat, so they sit in the same card.
3. **Track pips live on the theme that owns them.** Marking Attention after a
   roll costs no navigation.
4. **The board is a layout, not a new set of components.** It arranges the same
   leaf components the phone uses: the chip, the track pips, the status card, the
   roll controls, the total.
5. **The phone does not change.** It keeps sheet, play and roll as separate
   routes with the tab bar. The board is what a desk can do that a phone cannot,
   so it is `lg:` only.
6. **Hit targets stay at 44px.** They are comfortable with a mouse, and shrinking
   them would fork the phone design.
7. **Desktop adds a focus ring and hover states.** A keyboard and a mouse each
   need an affordance that a finger never asked for.

### Roster and share

Neither view has the character shell, so neither gets a board. Both are one 448px
column today, which reads as a phone page stretched across a desk.

| View | At `lg` |
|---|---|
| Roster | The container widens. Cards flow two up, and three up at `xl`. The new-character bar leaves the sticky footer and joins the header row. |
| Share | The container widens. Theme blocks flow two up. Loadout and crew stay full width below them. |

Login and the not-invited page are already centred and self-sizing. They do not
change.

## 6. Unresolved

- The canvas now trails the build on every screen, not just the two named below.
  Read the app first and the artboards second.
- Exact hex values for the three type hues. See section 2.
- The Decay track box count (3) is confirmed and matches the artboards.
  Starting loadout Power is confirmed at 1 (PRD O5); the Loadout artboard
  still draws 4 and needs a canvas edit to match.
- The Loadout artboard draws tags grouped under the character's core themes.
  That was never how the rules work (7.6): the loadout is its own theme,
  built from loadout sets (a title tag, feature tags, weakness tags) that
  load and unload independent of the 4 core themes. The artboard needs a
  redraw in the canvas to show sets and their load state instead of a
  per-core-theme grouping; the built screen (`app/character/[id]/loadout`)
  already matches the corrected rules.
- Effect costs on the Reference screen. They come from the CHEATSHEET tab.

## 7. Editing the canvas

Edit the artboards in the canvas itself, at the link above. Saving there
publishes a new version.

The repo once held the artboard markup and a `build.py` that seeded the canvas
from it. That build is gone. Keeping two copies of nine screens in sync earned
nothing, because the canvas edits them directly and exports PNG and PDF on its
own.

One consequence: the canvas is the only copy. Nothing in git can rebuild it.
