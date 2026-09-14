# Metro:Otherscape Character Sheet — Interface design

Status: draft v1
Owner: Gavin Li
Related: [PRD.md](./PRD.md) (what the product does and why)

The PRD states no interface decisions. This document holds them.

Canvas: https://claude.ai/code/artifact/1e55c96a-02c5-4710-8b68-4d936b153b8e

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

| Role | Colour |
|---|---|
| Background | `#0A0A0F` |
| Surface | `#12121B` |
| Border | `#232331` |
| Text | `#F0EEF8` |
| Dim text | `#8A87A0` |
| Faint label | `#5A5770` |

The three type hues are named after the Google Sheets original. The exact fills
are unconfirmed. Replace these hexes when the sheet's values are to hand.

## 3. Type

| Face | Use |
|---|---|
| Chakra Petch | Tags, titles, buttons, Power totals |
| Barlow | Body text, question text, Identity and Ritual lines |
| JetBrains Mono | Section labels, question letters, Power math |

Question letters ride on every tag: `B` for a power tag, `wA` for a weakness tag.
A tag always shows which themebook question it answers.

## 4. Interface decisions

1. **Power is never a bare number.** The roll builder prints the breakdown above
   the total. A player checks the app's arithmetic without redoing it.
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

## 5. Unresolved

- Exact hex values for the three type hues. See section 2.
- Decay tracks are drawn as three boxes, and starting loadout Power as 4. Both
  are open in the PRD (O2, O5).
- Effect costs on the Reference screen. They come from the CHEATSHEET tab.

## 6. Rebuilding the canvas

`bodies/*.html` holds each artboard's markup. `_helmet.txt` holds the shared
fonts and reset. Edit those, never the generated files.

```
cd docs/design && python3 build.py
```

That writes the `*.dc.html` artboards. Both the artboards and the seeded 2.5 MB
canvas payload are generated, so neither is committed.
