"use client";

import Link from "next/link";
import { use } from "react";
import { DecayWarning, LABEL, LoseTheme, Track } from "@/app/character/[id]/parts";
import { useCharacter } from "@/app/character/[id]/provider";
import { decayFull } from "@/lib/character/loss";
import { themeLine } from "@/lib/character/theme";
import type { Essence, GhostMemory, Theme } from "@/lib/character/types";
import { specialName } from "@/lib/pickers";
import { DECAY_TRACK_LENGTH, UPGRADE_TRACK_LENGTH } from "@/lib/rules/constants";
import { ESSENCES, essenceSuggestion } from "@/lib/rules/essence-suggestion";
import { themeCountWarning } from "@/lib/rules/readiness";
import { tagLabel } from "@/lib/tag-label";

export default function SheetPage({ params }: PageProps<"/character/[id]">) {
  const { id } = use(params);
  const { character, dispatch } = useCharacter();
  const warning = themeCountWarning(character.themes.length);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-5 pt-6">
      <Link
        href="/"
        className="inline-flex min-h-11 items-center gap-1.5 font-mono text-[10px] tracking-[0.08em] text-dim uppercase"
      >
        <span aria-hidden>←</span>
        Characters
      </Link>

      <label className="flex flex-col gap-1">
        <span className={LABEL}>Name</span>
        <input
          value={character.name}
          onChange={(event) => dispatch({ type: "rename", name: event.target.value })}
          className="min-h-11 rounded-sm border border-border bg-surface px-3 font-display text-[21px] font-bold tracking-[0.05em] uppercase"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className={LABEL}>Played by</span>
        <input
          value={character.playerName}
          onChange={(event) =>
            dispatch({ type: "setPlayerName", playerName: event.target.value })
          }
          className="min-h-11 rounded-sm border border-border bg-surface px-3 font-sans text-base"
        />
      </label>

      {warning && <p className="font-sans text-sm text-negative-text">{warning}</p>}

      {character.themes.length === 0 ? (
        <p className="font-sans text-sm text-dim">This character has no themes yet.</p>
      ) : (
        character.themes.map((theme) => (
          <ThemeCard key={theme.id} theme={theme} href={`/character/${id}/theme/${theme.id}`} />
        ))
      )}

      {/* T55: the replacement for a lost theme, and the way to add any other. */}
      <button
        type="button"
        onClick={() => dispatch({ type: "addTheme", id: crypto.randomUUID() })}
        className="inline-flex min-h-11 items-center self-start rounded-sm border border-border px-4 font-display text-sm font-semibold tracking-[0.08em] uppercase"
      >
        Add a theme
      </button>

      <EssenceCard />
      <GhostMemories />
    </main>
  );
}

// The Essence belongs to the character, not to a theme, so no data-type hue.
function EssenceCard() {
  const { character, dispatch } = useCharacter();
  // Derived every render: the theme mix is the only source, and the suggestion
  // is never stored. Nothing here writes character.essence except a player click.
  const { candidates, warning } = essenceSuggestion(character.themes, character.essence);
  const others = ESSENCES.filter((essence) => !candidates.includes(essence));

  const chip = (essence: Essence) => (
    <label
      key={essence}
      className={`inline-flex min-h-11 items-center gap-2 rounded-sm border px-3 font-display text-sm font-semibold tracking-[0.08em] uppercase ${
        character.essence === essence ? "border-primary text-text" : "border-border text-dim"
      }`}
    >
      <input
        type="radio"
        name="essence"
        value={essence}
        checked={character.essence === essence}
        onChange={() => dispatch({ type: "setEssence", essence })}
        className="size-[18px] accent-primary"
      />
      {essence}
    </label>
  );

  return (
    <section className="flex flex-col gap-3 rounded-md border border-border bg-surface p-4">
      <fieldset>
        <legend className={LABEL}>Essence</legend>

        <div className="flex flex-col gap-2 pt-1">
          <p className="font-sans text-sm text-dim">
            {candidates.length > 0
              ? "Your themes suggest this. Take it, or choose another."
              : "Add a theme and the sheet suggests an Essence. Until then, choose one yourself."}
          </p>

          {candidates.length > 0 && (
            <div className="flex flex-wrap gap-2">{candidates.map(chip)}</div>
          )}

          {warning && <p className="font-sans text-sm text-negative-text">{warning}</p>}

          <p className={LABEL}>{candidates.length > 0 ? "Other Essences" : "All Essences"}</p>
          <div className="flex flex-wrap gap-2">{others.map(chip)}</div>
        </div>
      </fieldset>

      <label className="flex flex-col gap-1">
        <span className={LABEL}>Essence special</span>
        <textarea
          value={character.essenceSpecial}
          onChange={(event) =>
            dispatch({ type: "setEssenceSpecial", essenceSpecial: event.target.value })
          }
          className="min-h-11 rounded-sm border border-border bg-surface p-3 font-sans text-base field-sizing-content"
        />
      </label>
    </section>
  );
}

// data-type sits here and nowhere else. Every chip below reads --hue, --hue-title
// and --hue-text off the cascade, so no chip has to learn its own theme type.
function ThemeCard({ theme, href }: { theme: Theme; href: string }) {
  const title = theme.powerTags.find((tag) => tag.id === theme.titleTagId);

  return (
    <article
      data-type={theme.type}
      className="flex flex-col gap-3 rounded-md border border-border bg-surface p-4"
    >
      {/* The heading is the way in to the theme screen, so the card's largest
          text is also its tap target. */}
      <Link href={href} className="flex flex-col gap-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className={LABEL}>{theme.themebook.trim() || "No themebook"}</span>
          {theme.nascent && <span className={LABEL}>Nascent</span>}
        </span>

        {title ? (
          // The title tag sits outside the chip list, so it carries its own
          // data-burnt. A burnt title paints achromatic like any other tag.
          <h2
            data-burnt={title.burnt ? "true" : undefined}
            className={`font-display text-[21px] leading-tight font-bold tracking-[0.05em] text-[var(--hue-title)] uppercase ${
              title.burnt ? "line-through" : ""
            }`}
          >
            {title.text}
          </h2>
        ) : (
          <h2 className="min-h-11 content-center font-sans text-sm text-dim">No title tag yet.</h2>
        )}
      </Link>

      <ul className="flex flex-col gap-1.5">
        {/* The title tag is a power tag, and it is the heading above, so the
            list holds the rest. */}
        {theme.powerTags
          .filter((tag) => tag.id !== theme.titleTagId)
          .map((tag) => (
            <Chip
              key={tag.id}
              label={tagLabel(tag, "power")}
              text={tag.text}
              burnt={tag.burnt}
            />
          ))}

        {theme.weaknessTags.map((tag) => (
          <Chip key={tag.id} label={tagLabel(tag, "weakness")} text={tag.text} negative />
        ))}
      </ul>

      {theme.specials.length > 0 && (
        <ul className="flex flex-col gap-1">
          {/* The name alone: the card has no room for the rule, and the theme
              screen prints both. */}
          {theme.specials.map((special, index) => (
            <li key={index} className="font-sans text-[13px] text-dim">
              {specialName(special)}
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-x-4">
        <Track themeId={theme.id} track="upgrade" marked={theme.upgrade} />
        <Track themeId={theme.id} track="decay" marked={theme.decay} />
      </div>

      {/* The offer, never the act. The theme screen carries the same button at
          any Decay mark, since the track is one trigger among many (PRD 7.4). */}
      {decayFull(theme) && (
        <>
          <DecayWarning />
          <LoseTheme themeId={theme.id} named={title?.text.trim() || "this theme"} />
        </>
      )}
    </article>
  );
}

/** PRD 6: the archive players read back. Read-only, and never editable. */
function GhostMemories() {
  const { character } = useCharacter();
  if (character.ghostMemories.length === 0) return null;

  return (
    <section className="flex flex-col gap-4 rounded-md border border-border bg-surface p-4">
      <h2 className={LABEL}>Ghost memories</h2>
      {character.ghostMemories.map((memory) => (
        <GhostEntry key={memory.id} memory={memory} />
      ))}
    </section>
  );
}

function GhostEntry({ memory }: { memory: GhostMemory }) {
  const { theme } = memory;
  const title = theme.powerTags.find((tag) => tag.id === theme.titleTagId);

  return (
    <article
      data-type={theme.type}
      className="flex flex-col gap-1 border-l-2 border-[var(--hue)] pl-2"
    >
      <span className={LABEL}>
        {theme.themebook.trim() || "No themebook"} · {theme.type}
      </span>
      <h3 className="font-display text-[17px] leading-tight font-bold tracking-[0.05em] text-[var(--hue-title)] uppercase">
        {title?.text.trim() || "Untitled theme"}
      </h3>
      <p className="font-sans text-[13px] text-dim">
        {/* lazy: the UTC date, because this client component renders on the
            server too and a locale-formatted time would not survive hydration.
            Ceiling: a theme lost late at night reads as the next day. Upgrade
            path: format it in an effect, once the browser has the page. */}
        Lost <time dateTime={memory.lostAt}>{memory.lostAt.slice(0, 10)}</time>.{" "}
        {memory.reason.trim() || "No reason was written down."}
      </p>

      <details>
        <summary className="min-h-11 cursor-pointer content-center font-mono text-[10px] tracking-[0.08em] text-dim uppercase">
          Read it back
        </summary>

        <ul className="flex flex-col gap-1.5">
          {theme.powerTags.map((tag) => (
            <Chip key={tag.id} label={tagLabel(tag, "power")} text={tag.text} burnt={tag.burnt} />
          ))}
          {theme.weaknessTags.map((tag) => (
            <Chip key={tag.id} label={tagLabel(tag, "weakness")} text={tag.text} negative />
          ))}
        </ul>

        {theme.quote.trim() && (
          <p className="pt-1 font-sans text-[13px] text-dim">
            {themeLine(theme.type)}: {theme.quote}
          </p>
        )}

        {theme.specials.map((special, index) => (
          <p key={index} className="pt-1 font-sans text-[13px] text-dim">
            {special}
          </p>
        ))}

        <p className={`${LABEL} pt-1`}>
          {theme.nascent ? "Nascent · " : ""}
          Upgrade {theme.upgrade} of {UPGRADE_TRACK_LENGTH} · Decay {theme.decay} of{" "}
          {DECAY_TRACK_LENGTH}
        </p>
      </details>
    </article>
  );
}

function Chip({
  label,
  text,
  burnt,
  negative,
}: {
  label: string;
  text: string;
  burnt?: boolean;
  negative?: boolean;
}) {
  return (
    <li
      data-burnt={burnt ? "true" : undefined}
      data-valence={negative ? "negative" : undefined}
      className="flex min-h-11 items-center gap-2 border-l-2 border-[var(--hue)] pl-2"
    >
      <span className="font-mono text-[10px] text-[var(--hue)]">{label}</span>
      {/* Burnt reads as struck through as well as achromatic, so the state does
          not rest on colour alone. */}
      <span
        className={`font-display text-[15px] tracking-[0.03em] text-[var(--hue-text)] ${
          burnt ? "line-through" : ""
        }`}
      >
        {text}
      </span>
    </li>
  );
}
