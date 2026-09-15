"use client";

// The chrome the themebook, question, and specials pickers share. Each one is a
// route rather than an overlay (sysdesign 9), so the phone back button leaves it.

import Link from "next/link";
import type { ThemeType } from "@/lib/character/types";

const PAGE = "mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-5 pt-3 pb-2";

const BACK =
  "-mb-2 inline-flex min-h-11 items-center gap-1.5 font-mono text-[10px] tracking-[0.08em] text-dim uppercase";

const BUTTON =
  "inline-flex min-h-11 items-center self-start rounded-sm border border-border px-4 font-display text-sm font-semibold tracking-[0.08em] uppercase";

/** One choice. A button or a link in a list, never a dropdown (sysdesign 10). */
export const ROW =
  "flex min-h-11 w-full flex-col justify-center gap-0.5 rounded-sm border border-border bg-surface px-3 py-2 text-left aria-pressed:border-[var(--hue)]";

export const ROW_TEXT = "font-sans text-[13px] text-dim";

/** data-type sits on the root, so every row below reads the theme's hue off the cascade. */
export function PickerFrame({
  id,
  tid,
  type,
  title,
  children,
}: {
  id: string;
  tid: string;
  type: ThemeType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main data-type={type} className={PAGE}>
      <Link href={`/character/${id}/theme/${tid}`} className={BACK}>
        <span aria-hidden>←</span>
        Theme
      </Link>

      <h1 className="font-display text-[26px] leading-tight font-bold tracking-[0.05em] text-[var(--hue-title)] uppercase">
        {title}
      </h1>

      {children}
    </main>
  );
}

function Missing({ href, label, sentence }: { href: string; label: string; sentence: string }) {
  return (
    <main className={PAGE}>
      <p className="font-sans text-base text-dim">{sentence}</p>
      <Link href={href} className={BUTTON}>
        {label}
      </Link>
    </main>
  );
}

/** The theme went while a picker was open: another device can lose one. */
export const MissingTheme = ({ id }: { id: string }) => (
  <Missing
    href={`/character/${id}`}
    label="Back to the sheet"
    sentence="This character has no such theme. It may have been lost or replaced."
  />
);

export const MissingTag = ({ id, tid }: { id: string; tid: string }) => (
  <Missing
    href={`/character/${id}/theme/${tid}`}
    label="Back to the theme"
    sentence="This theme has no such tag. It may have been deleted."
  />
);
