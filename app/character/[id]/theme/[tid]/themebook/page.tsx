"use client";

import { Button } from "@base-ui/react/button";
import { Input } from "@base-ui/react/input";
import { Toggle } from "@base-ui/react/toggle";
import { use, useState } from "react";
import { PickerFrame, ROW, ROW_TEXT } from "@/app/character/[id]/_components/picker";
import { LABEL } from "@/app/character/[id]/_components/styles";
import { MissingTheme } from "@/app/character/[id]/theme/[tid]/_components/picker";
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
    <PickerFrame
      backHref={`/character/${id}/theme/${tid}`}
      backLabel="Theme"
      type={theme.type}
      title="Themebook"
    >
      <p className="font-sans text-sm text-dim">
        Every {theme.type} themebook, and the concept it covers.
      </p>

      <ul className="flex flex-col gap-2">
        {themebooksOfType(pack, theme.type).map((book) => (
          <li key={book.id}>
            <Toggle
              pressed={chosen?.id === book.id}
              onPressedChange={() => set(book.name)}
              className={ROW}
            >
              <span className="font-display text-[15px] font-semibold tracking-[0.03em] text-[var(--hue-title)] uppercase">
                {book.name}
              </span>
              <span className={ROW_TEXT}>{book.concept}</span>
            </Toggle>
          </li>
        ))}
      </ul>

      {/* A themebook of the player's own reads no concept and
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
          <Input
            type="text"
            value={homebrew}
            onChange={(event) => setHomebrew(event.target.value)}
            placeholder="A themebook of your own"
            className="min-h-11 rounded-sm border border-border bg-bg px-3 font-sans text-base"
          />
        </label>
        <Button
          type="submit"
          className="mt-1 inline-flex min-h-11 items-center self-start rounded-sm border border-[var(--hue)] px-4 font-display text-sm font-semibold tracking-[0.08em] text-[var(--hue)] uppercase"
        >
          Use this name
        </Button>
      </form>
    </PickerFrame>
  );
}
