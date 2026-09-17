"use client";

import { Button } from "@base-ui/react/button";
import { Input } from "@base-ui/react/input";
import { Select } from "@base-ui/react/select";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { DecayWarning } from "@/app/character/[id]/_components/decay-warning";
import { LoseThemeButton, LoseThemeDialog } from "@/app/character/[id]/_components/lose-theme";
import { ROW, ROW_TEXT } from "@/app/character/[id]/_components/picker";
import { SpecialList } from "@/app/character/[id]/_components/special-card";
import { LABEL } from "@/app/character/[id]/_components/styles";
import { Track, UpgradeDialog } from "@/app/character/[id]/_components/track";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { decayFull } from "@/lib/character/loss";
import { isNascent, themeLine, themeTitle } from "@/lib/character/theme";
import { useContentPack } from "@/lib/content/load";
import { findThemebook, themebooksOfType } from "@/lib/content/pack";
import type { ThemeType } from "@/lib/character/types";
import { TagRow } from "./_components/tag-row";
import { BackLink } from "@/components/back-link";

const THEME_TYPES: ThemeType[] = ["self", "mythos", "noise"];

const FIELD = "min-h-11 rounded-sm border border-border bg-bg px-3 font-sans text-base";
const BASE = "inline-flex min-h-11 items-center self-start rounded-sm border px-4 font-display text-sm font-semibold tracking-[0.08em] uppercase";
const ADD = `${BASE} border-[var(--hue)] text-[var(--hue)]`;
const ADD_WEAKNESS = `${BASE} border-negative text-negative`;

const POPUP =
  "z-40 max-h-[70vh] w-[var(--anchor-width)] overflow-y-auto rounded-sm border border-border bg-surface p-1.5 outline-none";
const TYPE_ITEM =
  "flex min-h-11 cursor-pointer items-center rounded-sm px-3 font-display text-sm font-semibold tracking-[0.08em] text-dim uppercase outline-none data-[highlighted]:bg-bg data-[selected]:text-[var(--hue)]";
const THEMEBOOK_TRIGGER =
  "col-span-2 flex min-h-11 items-center justify-between gap-2 rounded-sm border border-border bg-bg px-3 text-left";
const THEMEBOOK_POPUP =
  "z-40 max-h-[75vh] w-[min(92vw,380px)] overflow-y-auto rounded-sm border border-border bg-surface p-2 outline-none";
const THEMEBOOK_ITEM = `${ROW} cursor-pointer outline-none data-[highlighted]:border-dim data-[selected]:border-[var(--hue)]`;

export default function ThemePage({ params }: PageProps<"/character/[id]/theme/[tid]">) {
  const { id, tid } = use(params);
  const { character, dispatch } = useCharacter();
  const router = useRouter();
  const pack = useContentPack();

  const theme = character.themes.find((candidate) => candidate.id === tid);
  const chosenBook = theme ? findThemebook(pack, theme.themebook) : null;
  const [themebookOpen, setThemebookOpen] = useState(false);
  const [homebrew, setHomebrew] = useState("");
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [loseOpen, setLoseOpen] = useState(false);

  const back = `/character/${id}`;
  const here = `${back}/theme/${tid}`;

  if (!theme) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-5 pt-6">
        <p className="font-sans text-base text-dim">
          This character has no such theme. It may have been lost or replaced.
        </p>
        <Link
          href={back}
          className="inline-flex min-h-11 items-center self-start rounded-sm border border-border px-4 font-display text-sm font-semibold tracking-[0.08em] uppercase"
        >
          Back to the sheet
        </Link>
      </main>
    );
  }

  const title = themeTitle(theme);
  const nascent = isNascent(theme);

  return (
    <main
      data-type={theme.type}
      className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-5 pt-3 pb-8"
    >
      <BackLink href={back} text="Sheet" />

      <section className="grid grid-cols-3 gap-1.5">
        <Select.Root
          value={theme.type}
          onValueChange={(themeType) => {
            if (themeType) dispatch({ type: "setThemeType", themeId: theme.id, themeType });
          }}
        >
          <Select.Trigger className="col-span-1 flex min-h-11 items-center justify-center gap-1.5 rounded-sm border border-[var(--hue)] px-4 font-display text-sm font-semibold tracking-[0.08em] text-[var(--hue)] uppercase">
            {theme.type}
            <Select.Icon aria-hidden className="text-xs">
              ▾
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner sideOffset={4} align="start">
              <Select.Popup className={POPUP}>
                <Select.List>
                  {THEME_TYPES.map((value) => (
                    <Select.Item key={value} value={value} className={TYPE_ITEM}>
                      <Select.ItemText>{value}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.List>
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>

        <Select.Root
          open={themebookOpen}
          onOpenChange={(open) => {
            setThemebookOpen(open);
            if (open) setHomebrew(chosenBook ? "" : theme.themebook);
          }}
          value={chosenBook?.name ?? null}
          onValueChange={(themebook) => {
            if (themebook) dispatch({ type: "setThemebook", themeId: theme.id, themebook });
          }}
        >
          <Select.Trigger
            aria-label={`Themebook: ${theme.themebook.trim() || "none yet"}. Tap to change.`}
            className={THEMEBOOK_TRIGGER}
          >
            <span
              className={
                theme.themebook.trim()
                  ? "truncate font-display text-sm font-semibold tracking-[0.08em] text-[var(--hue)] uppercase"
                  : "font-sans text-base text-dim"
              }
            >
              {theme.themebook.trim() || "Choose a themebook"}
            </span>
            <Select.Icon aria-hidden className="shrink-0 text-xs text-dim">
              ▾
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner sideOffset={4} align="start">
              <Select.Popup className={THEMEBOOK_POPUP}>
                <Select.List className="flex flex-col gap-1.5">
                  {themebooksOfType(pack, theme.type).map((book) => (
                    <Select.Item key={book.id} value={book.name} className={THEMEBOOK_ITEM}>
                      <Select.ItemText className="font-display text-[15px] font-semibold tracking-[0.03em] text-[var(--hue-title)] uppercase">
                        {book.name}
                      </Select.ItemText>
                      <span className={ROW_TEXT}>{book.concept}</span>
                    </Select.Item>
                  ))}
                </Select.List>

                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    dispatch({
                      type: "setThemebook",
                      themeId: theme.id,
                      themebook: homebrew.trim(),
                    });
                    setThemebookOpen(false);
                  }}
                  className="mt-2 flex flex-col gap-1 border-t border-border pt-2"
                >
                  <span className={LABEL}>Homebrew themebook</span>
                  <Input
                    type="text"
                    value={homebrew}
                    onChange={(event) => setHomebrew(event.target.value)}
                    placeholder="A themebook of your own"
                    className={FIELD}
                  />
                  <Button type="submit" className={`${ADD} mt-1`}>
                    Use this name
                  </Button>
                </form>
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
      </section>

      <h1
        data-burnt={title?.burnt ? "true" : undefined}
        className={`font-display text-[26px] leading-tight font-bold tracking-[0.05em] text-[var(--hue-title)] uppercase ${
          title?.burnt ? "line-through" : ""
        }`}
      >
        {title?.text.trim() || "Untitled theme"}
      </h1>

      <section className="flex gap-[10px]">
        <Track
          themeId={theme.id}
          track="upgrade"
          marked={theme.upgrade}
          size="lg"
          onComplete={() => setUpgradeOpen(true)}
        />
        <Track themeId={theme.id} track="decay" marked={theme.decay} size="lg" />
      </section>

      <UpgradeDialog
        themeId={theme.id}
        themeHref={here}
        nascent={nascent}
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
      />

      <section className="flex flex-col gap-2">
        <h2 className={LABEL}>Power tags</h2>
        <ul className="flex flex-col gap-3">
          {theme.powerTags.map((tag, index) => (
            <TagRow
              key={tag.id}
              kind="power"
              themeId={theme.id}
              tag={tag}
              href={`${here}/tag/${tag.id}`}
              index={index}
              count={theme.powerTags.length}
            />
          ))}
        </ul>

        <h2 className={LABEL}>Weakness tags</h2>
        <ul className="flex flex-col gap-3">
          {theme.weaknessTags.map((tag, index) => (
            <TagRow
              key={tag.id}
              kind="weakness"
              themeId={theme.id}
              tag={tag}
              href={`${here}/tag/${tag.id}`}
              index={index}
              count={theme.weaknessTags.length}
            />
          ))}
        </ul>
      </section>

      <section className="flex flex-row gap-2">
        <Button
          type="button"
          onClick={() =>
            dispatch({
              type: "addPowerTag",
              themeId: theme.id,
              id: crypto.randomUUID(),
              letter: "A",
            })
          }
          className={ADD}
        >
          New power tag
        </Button>
        
        <Button
          type="button"
          onClick={() =>
            dispatch({
              type: "addWeaknessTag",
              themeId: theme.id,
              id: crypto.randomUUID(),
              letter: "A",
            })
          }
          className={ADD_WEAKNESS}
        >
          New weakness tag
        </Button>
      </section>

      <label className="flex flex-col gap-1">
        <span className={LABEL}>{themeLine(theme.type)}</span>
        <Input
          type="text"
          value={theme.quote}
          onChange={(event) =>
            dispatch({ type: "setThemeQuote", themeId: theme.id, quote: event.target.value })
          }
          placeholder={`Create your ${themeLine(theme.type)}`}
          className={FIELD}
        />
      </label>

      <section className="flex flex-col gap-1.5">
        <h2 className={LABEL}>Theme specials</h2>
        {theme.specials.length === 0 ? (
          <p className="font-sans text-sm text-dim">No theme specials yet.</p>
        ) : (
          <SpecialList
            specials={theme.specials}
            onRemove={(special) =>
              dispatch({ type: "removeThemeSpecial", themeId: theme.id, special })
            }
          />
        )}
        <Link href={`${here}/specials`} className={`${ADD} mt-1`}>
          New theme special
        </Link>
      </section>

      <section className="flex flex-col gap-2 pb-2">
        {decayFull(theme) && <DecayWarning />}
        <LoseThemeButton
          named={title?.text.trim() || "this theme"}
          onOpen={() => setLoseOpen(true)}
        />
        <LoseThemeDialog
          themeId={theme.id}
          named={title?.text.trim() || "this theme"}
          open={loseOpen}
          onOpenChange={setLoseOpen}
          onLost={() => router.replace(back)}
        />
      </section>
    </main>
  );
}
