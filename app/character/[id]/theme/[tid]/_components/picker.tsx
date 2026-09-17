"use client";

import Link from "next/link";
import { PAGE } from "@/app/character/[id]/_components/picker";

const BUTTON =
  "inline-flex min-h-11 items-center self-start rounded-sm border border-border px-4 font-display text-sm font-semibold tracking-[0.08em] uppercase";

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
