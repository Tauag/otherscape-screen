"use client";

import { Dialog } from "@base-ui/react/dialog";
import { useEffect, useState } from "react";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import type { LoadoutTag, LoadoutTagKind, Theme, ThemeType } from "@/lib/character/types";
import { groupLoadout, type UpgradeChoice } from "@/lib/loadout-edit";
import {
  LOADOUT_TAG_COST,
  UPGRADE_TRACK_LENGTH,
  WILDCARD_TAG_COST,
} from "@/lib/rules/constants";
import { loadoutSpend } from "@/lib/rules/loadout";

const LABEL = "font-mono text-[10px] tracking-[0.08em] text-faint uppercase";

const BUTTON =
  "inline-flex min-h-11 items-center rounded-sm border border-border px-3 font-display text-xs font-semibold tracking-[0.08em] uppercase";

const KIND: Record<LoadoutTagKind, string> = {
  tag: "Tag",
  wildcard: "Wildcard",
  flaw: "Flaw",
};

/** The price rides on the button that spends it. A flaw is free, so it says nothing. */
const ADD: Record<LoadoutTagKind, string> = {
  tag: `Tag ${LOADOUT_TAG_COST}P`,
  wildcard: `Wildcard ${WILDCARD_TAG_COST}P`,
  flaw: "Flaw",
};

function themeName(theme: Theme): string {
  const title = theme.powerTags.find((tag) => tag.id === theme.titleTagId);
  return title?.text.trim() || theme.themebook.trim() || "Untitled theme";
}

export default function LoadoutPage() {
  const { character, dispatch } = useCharacter();
  const { loadout } = character;
  const { groups, misc } = groupLoadout(loadout, character.themes);
  const spend = loadoutSpend(loadout);

  const [open, setOpen] = useState(false);

  // A full track prompts, once per filling. Escape closes it without choosing,
  // and the button below the track opens it again.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (loadout.upgrade === UPGRADE_TRACK_LENGTH) setOpen(true);
  }, [loadout.upgrade]);
  /* eslint-enable react-hooks/set-state-in-effect */

  function take(choice: UpgradeChoice) {
    dispatch({ type: "takeLoadoutUpgrade", choice });
    setOpen(false);
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-5 pt-6">
      <section>
        <p className={LABEL}>Themes in the loadout</p>
        {character.themes.length === 0 ? (
          <p className="pt-2 font-sans text-sm text-dim">This character has no themes yet.</p>
        ) : (
          <ul className="flex flex-wrap gap-2 pt-2">
            {character.themes.map((theme) => (
              <li key={theme.id}>
                <button
                  type="button"
                  data-type={theme.type}
                  aria-pressed={loadout.themeIds.includes(theme.id)}
                  onClick={() => dispatch({ type: "toggleLoadoutTheme", themeId: theme.id })}
                  className={`${BUTTON} text-dim aria-pressed:border-[var(--hue)] aria-pressed:text-[var(--hue-text)]`}
                >
                  {themeName(theme)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {groups.map(({ theme, tags }) => (
        <TagSet
          key={theme.id}
          type={theme.type}
          name={themeName(theme)}
          themeId={theme.id}
          tags={tags}
          kinds={["tag", "flaw"]}
        />
      ))}

      <TagSet name="Misc" themeId={null} tags={misc} kinds={["tag", "wildcard", "flaw"]} />

      <section>
        <p className={LABEL}>Power</p>
        <p className="pt-1 font-mono text-sm text-dim">
          <span className="font-display text-2xl leading-none font-bold text-primary">
            {spend.spent}
          </span>{" "}
          spent of {spend.available} available
        </p>
        {spend.warning && (
          <p className="pt-1 font-sans text-sm text-negative-text">{spend.warning}</p>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <p className={LABEL}>Loadout specials</p>
        {loadout.specials.length === 0 ? (
          <p className="font-sans text-sm text-dim">None yet. A loadout Upgrade can take one.</p>
        ) : (
          loadout.specials.map((text, index) => (
            <textarea
              // The specials keep their order, so the index is the identity.
              key={index}
              value={text}
              aria-label={`Loadout special ${index + 1}`}
              onChange={(event) =>
                dispatch({ type: "editLoadoutSpecial", index, text: event.target.value })
              }
              className="field-sizing-content min-h-11 rounded-sm border border-border bg-surface px-3 py-2.5 font-sans text-base"
            />
          ))
        )}
      </section>

      <section className="flex flex-col items-start gap-2 pb-2">
        <div className="flex items-center gap-1" role="group" aria-label="Loadout Upgrade track">
          <p className={LABEL}>Upgrade</p>
          {Array.from({ length: UPGRADE_TRACK_LENGTH }, (_, index) => (
            <label key={index} className="grid size-11 place-items-center">
              <input
                type="checkbox"
                checked={index < loadout.upgrade}
                onChange={() => dispatch({ type: "markLoadoutUpgrade", index })}
                className="size-[18px] accent-primary"
              />
              <span className="sr-only">{`Upgrade ${index + 1} of ${UPGRADE_TRACK_LENGTH}`}</span>
            </label>
          ))}
        </div>
        <p className="font-sans text-sm text-dim">Mark a point when you use a loadout flaw.</p>
        {loadout.upgrade === UPGRADE_TRACK_LENGTH && (
          <button type="button" onClick={() => setOpen(true)} className={BUTTON}>
            Take the Upgrade
          </button>
        )}
      </section>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 bg-bg/80" />
          <Dialog.Popup className="fixed inset-0 m-auto w-[90vw] max-w-[420px] rounded-md border border-border bg-surface p-5 text-text">
            <Dialog.Title className="font-display text-base font-bold tracking-[0.08em] uppercase">
              Take the loadout Upgrade
            </Dialog.Title>
            <p className="mt-2 font-sans text-sm text-dim">
              The track is full. Take one of the two. The track clears either way.
            </p>

            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => take("power")}
                className="inline-flex min-h-11 items-center rounded-sm bg-primary px-4 font-display text-sm font-bold tracking-[0.08em] text-bg uppercase"
              >
                1 more available Power
              </button>
              <button
                type="button"
                onClick={() => take("special")}
                className="inline-flex min-h-11 items-center rounded-sm bg-primary px-4 font-display text-sm font-bold tracking-[0.08em] text-bg uppercase"
              >
                A loadout special
              </button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </main>
  );
}

// data-type sits here and nowhere else, so every tag below reads the hue off the
// cascade. A misc set carries no theme, so it falls back to the neutral tokens.
function TagSet({
  type,
  name,
  themeId,
  tags,
  kinds,
}: {
  type?: ThemeType;
  name: string;
  themeId: string | null;
  tags: LoadoutTag[];
  kinds: LoadoutTagKind[];
}) {
  const { dispatch } = useCharacter();

  return (
    <section
      data-type={type}
      className="flex flex-col gap-3 rounded-md border border-border bg-surface p-4"
    >
      <p className={LABEL}>{name}</p>

      {tags.length > 0 && (
        <ul className="flex flex-col gap-2">
          {tags.map((tag) => (
            <Row key={tag.id} tag={tag} />
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-2">
        {kinds.map((kind) => (
          <button
            key={kind}
            type="button"
            onClick={() =>
              dispatch({ type: "addLoadoutTag", id: crypto.randomUUID(), kind, themeId })
            }
            className={`${BUTTON} text-dim`}
          >
            + {ADD[kind]}
          </button>
        ))}
      </div>
    </section>
  );
}

function Row({ tag }: { tag: LoadoutTag }) {
  const { dispatch } = useCharacter();

  return (
    <li
      data-valence={tag.kind === "flaw" ? "negative" : undefined}
      className="flex items-center gap-2 border-l-2 border-[var(--hue,var(--color-border))] pl-2"
    >
      <label className="flex flex-1 items-center gap-2">
        <span className="font-mono text-[10px] text-[var(--hue,var(--color-dim))]">
          {KIND[tag.kind]}
        </span>
        <input
          type="text"
          value={tag.text}
          onChange={(event) =>
            dispatch({ type: "editLoadoutTag", id: tag.id, text: event.target.value })
          }
          className="min-h-11 w-full rounded-sm bg-bg px-2 font-display text-[15px] tracking-[0.03em] text-[var(--hue-text,var(--color-text))]"
        />
      </label>

      <button
        type="button"
        onClick={() => dispatch({ type: "removeLoadoutTag", id: tag.id })}
        className="grid size-11 shrink-0 place-items-center text-dim"
      >
        <span aria-hidden>×</span>
        <span className="sr-only">{`Remove ${KIND[tag.kind].toLowerCase()} ${tag.text}`}</span>
      </button>
    </li>
  );
}
