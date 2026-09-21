# Desktop play board — implementation brief

Status: draft v1
Owner: Gavin Li
Related: [design.md](./design.md) section 5 (what it looks like and why),
[tasks.md](./tasks.md) T43 and T43b, [system-design.md](./system-design.md) section 9

This brief is for whoever builds T43. design.md holds the design; this holds the
reuse inventory, the traps, and the build order.

**The artboards are HTML, not pictures.** Read them for exact sizes, weights,
gaps and states:
https://claude.ai/artifact/RCKXKQMFzc2jCWQUxoFfv5 (`project/Main.dc.html`,
`project/Tablet-1024.dc.html`).

## 1. The one fact the build rests on

`rollGroups(character)` in `app/character/[id]/_lib/roll-selection.ts` already
returns the board's panels: one group per theme, plus crew, plus loadout, each
carrying `id`, `hue`, a `label` already formatted `"self · Divided"`, and
`tags: RollTag[]` with burn state, crispy, broad and valence resolved.

The roll screen stacks those groups vertically. The board lays them in a grid.
Same data, same chips, different container. Nothing about Power, burning, or
selection is re-derived.

## 2. Reuse inventory

Used unchanged:

| Piece | File |
|---|---|
| `rollGroups`, `toRollSelection`, `rollOrder`, `burnToggleAction`, `burningTagId`, `signed` | `_lib/roll-selection.ts` |
| `power` | `lib/rules/power.ts` |
| `RollChip` | `roll/_components/roll-chip.tsx` |
| `Track`, `TrackPips` | `_components/track.tsx` |
| `RollControls`, `RollTotal`, `BurnOverride` | `roll/_components/` |
| `RowMenu`, `ChipBadge`, `useRollSelection`, the reducer | unchanged |

Full-width tag rows instead of wrapping chips is `flex-col` in place of
`flex-wrap` on the `ul`, plus `w-full` on the item. `RollChip` is untouched.

Changed, additively:

1. **`StatusCard` gains optional `selected` and `onToggle`.** The tier buttons
   stay their own controls; the card body becomes the roll toggle. The phone's
   play screen passes neither and renders exactly as today.
2. **`RollChip` gains `prominent?: boolean`** so a theme's title tag reads
   larger. The title tag is the power tag with letter `A`
   (`themeTitle`, `lib/character/theme.ts`).

New files, composition only, no new leaf components:

- `_components/board.tsx` — the grid, the rail, the dock.
- `_components/board-panel.tsx` — one group's header, pips, and tag rows.
- `_hooks/use-roll-board.ts` — see section 3.

## 3. The extraction that shrinks the code

`roll/page.tsx` lines 94-129 (`tagChip`) plus `toggle`, `setBurnt`,
`finalizeTagSelection`, `startMitigation` and `cancelMitigation` are about eighty
lines the board needs verbatim. Move them into `use-roll-board.ts` and have both
the phone roll route and the board consume it. The roll page gets shorter.

Do this first, on its own, with no visible change. `npm test` must stay green.

## 4. Traps

1. **`rollGroups` drops empty groups.** It ends with
   `.filter((group) => group.tags.length > 0)`. A nascent theme with no tags
   never appears, so iterating groups alone makes the "build this theme" panel
   vanish. Iterate `character.themes` (then loadout, then crew) and join to
   groups by `id`.
2. **Story tags cannot use `StoryTagChip` on the board.** It is an inline text
   input, so click-to-select fights click-to-type. The board renders them as
   `RollChip` plus a `RowMenu` for rename and delete. Selecting is constant,
   renaming is rare. The phone's play screen keeps the input.
3. **Statuses need the merged card**, because `RollChip` has no tier track. This
   is the `StatusCard` change in section 2, and it is the only component that
   grows.
4. **No hexes.** The artboards are inline hex for portability; components resolve
   through tokens. `globals.css` holds the same values under the same names, so
   the mapping is mechanical: `#e85a5f` → `--color-self` → `self`. A hue that
   comes from data rides the cascade via `data-type`, never an interpolated class
   name. See system-design.md section 10.
5. **Loadout and crew tracks differ from a theme's.** `Track` takes a `themeId`;
   the loadout uses `TrackPips` with `markLoadoutUpgrade`, and the crew uses
   `markCrewTrack`. The panel header branches on group kind.

## 5. Resolved layout questions

| Question | Answer |
|---|---|
| Theme specials on a panel | No. Not roll-selectable; they live in the theme editor and Reference. |
| Theme-count, essence-tie, over-budget, decay-full warnings | One full-width strip under the app bar, sharing the slot specced for the parked-copy sentence. |
| Mitigation banner | In the dock, replacing modifier and rolling-with while a mitigation is live. |
| Panel that outgrows its cell | The panel grows. The grid scrolls; dock and rail never move. |
| Table rail with many statuses | The rail scrolls alone. |
| Character with no themes | The grid shows loadout and crew only, plus the sheet's existing empty-state sentence in the warning strip. |

## 6. The server-render call

The server cannot know the viewport, and the board and the phone sheet are
different trees, so CSS alone cannot choose between them without mounting both.

**Render the phone tree on the server and swap to the board on hydration**, via a
`useSyncExternalStore` media-query hook whose server snapshot is "phone". This
keeps current behaviour as the default, costs one frame on desktop only, and
never double-mounts a character.

This is the one place T43 breaks "CSS decides". Do not hide the break by
rendering both trees.

## 7. Build order

Each step is mergeable on its own.

1. Extract `use-roll-board.ts`. No visible change. Tests green.
2. Add the two props from section 2. Still no visible change.
3. Build the board behind the `lg` branch.
4. T43b: editor routes take the full width; `/play` and `/roll` redirect to the
   board at `lg`.

## 8. Checks

The board is layout, so most of it is only verifiable in a browser. What is
testable:

- `use-roll-board.ts` keeps the existing `roll-selection.test.ts` coverage green.
- One new case: a nascent theme with zero tags still yields a panel (trap 1).

For the rest, run the app and look at it. The `/run` skill launches it.
