"use client";

import { use, useState } from "react";
import { LABEL } from "@/app/character/[id]/_components/parts";
import {
  MissingTheme,
  PickerFrame,
  ROW,
  ROW_TEXT,
} from "@/app/character/[id]/theme/[tid]/_components/picker";
import { usePick } from "@/app/character/[id]/theme/[tid]/_hooks/use-pick";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { useContentPack } from "@/lib/content/load";
import { findThemebook, themebooksOfType } from "@/lib/content/pack";

export default function ThemebookPicker({
  params,
}: PageProps<"/character/[id]/theme/[tid]/themebook">) {
  const { id, tid } = use(params);
  const { character } = useCharacter();
  const pack = useContentPack();
  const pick = usePick(id, tid);
  const theme = character.themes.find((candidate) => candidate.id === tid);
  const [homebrew, setHomebrew] = useState(theme?.themebook ?? "");

  if (!theme) return <MissingTheme id={id} />;

  const chosen = findThemebook(pack, theme.themebook);
  const set = (themebook: string) => pick({ type: "setThemebook", themeId: theme.id, themebook });

  return (
    <PickerFrame id={id} tid={tid} type={theme.type} title="Themebook">
      <p className="font-sans text-sm text-dim">
        Every {theme.type} themebook, and the concept it covers.
      </p>

      <ul className="flex flex-col gap-2">
        {themebooksOfType(pack, theme.type).map((book) => (
          <li key={book.id}>
            <button
              type="button"
              aria-pressed={chosen?.id === book.id}
              onClick={() => set(book.name)}
              className={ROW}
            >
              <span className="font-display text-[15px] font-semibold tracking-[0.03em] text-[var(--hue-title)] uppercase">
                {book.name}
              </span>
              <span className={ROW_TEXT}>{book.concept}</span>
            </button>
          </li>
        ))}
      </ul>

      {/* PRD 7.3 allows a themebook of the player's own. It reads no concept and
          no questions, so it lives under the list rather than in it. */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          set(homebrew.trim());
        }}
        className="flex flex-col gap-1"
      >
        <label className="flex flex-col gap-1">
          <span className={LABEL}>Homebrew themebook</span>
          <input
            type="text"
            value={homebrew}
            onChange={(event) => setHomebrew(event.target.value)}
            placeholder="A themebook of your own"
            className="min-h-11 rounded-sm border border-border bg-bg px-3 font-sans text-base"
          />
        </label>
        <button
          type="submit"
          className="mt-1 inline-flex min-h-11 items-center self-start rounded-sm border border-[var(--hue)] px-4 font-display text-sm font-semibold tracking-[0.08em] text-[var(--hue)] uppercase"
        >
          Use this name
        </button>
      </form>
    </PickerFrame>
  );
}
