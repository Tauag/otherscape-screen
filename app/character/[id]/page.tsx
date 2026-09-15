"use client";

import Link from "next/link";
import { use } from "react";
import { DecayWarning, LABEL, LoseTheme, Track } from "@/app/character/[id]/_components/parts";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { decayFull } from "@/lib/character/loss";
import { themeLine } from "@/lib/character/theme";
import type { Essence, GhostMemory, Theme } from "@/lib/character/types";
import { specialName } from "@/lib/pickers";
import { DECAY_TRACK_LENGTH, DEFAULT_BURN_VALUE, UPGRADE_TRACK_LENGTH } from "@/lib/rules/constants";
import { ESSENCES, essenceSuggestion } from "@/lib/rules/essence-suggestion";
import { themeCountWarning } from "@/lib/rules/readiness";
import { tagLabel } from "@/lib/tag-label";
import { BackLink } from "@/components/back-link";

export default function SheetPage({ params }: PageProps<"/character/[id]">) {
  const { id } = use(params);
  const { character, dispatch } = useCharacter();
  const warning = themeCountWarning(character.themes.length);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-5 pt-3">
      <BackLink href="/" text="Characters" />

      {warning && <p className="font-sans text-sm text-negative-text">{warning}</p>}

      {character.themes.length === 0 ? (
        <p className="font-sans text-sm text-dim">This character has no themes yet.</p>
      ) : (
        character.themes.map((theme) => (
          <ThemeCard key={theme.id} theme={theme} href={`/character/${id}/theme/${theme.id}`} />
        ))
      )}

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

function ThemeCard({ theme, href }: { theme: Theme; href: string }) {
  const title = theme.powerTags.find((tag) => tag.id === theme.titleTagId);
  const { nascent } = theme;

  return (
    <article
      data-type={theme.type}
      className={`flex overflow-hidden rounded-md border ${
        nascent ? "border-dashed border-raised bg-recess" : "border-border bg-surface"
      }`}
    >
      {/* Outside the body padding, so it runs the card's full height. */}
      <div
        aria-hidden="true"
        className={`w-[3px] shrink-0 ${nascent ? "bg-[var(--hue)]/35" : "bg-[var(--hue)]"}`}
      />

      <div className="flex min-w-0 flex-1 flex-col gap-[9px] px-3 pt-[11px] pb-2.5">
        <div className="flex items-center justify-between gap-2">
          <Link
            href={href}
            className={`font-display text-[10px] font-semibold tracking-[0.17em] uppercase ${
              nascent ? "text-muted" : "text-dim"
            }`}
          >
            {theme.type} · {theme.themebook.trim() || "No themebook"}
          </Link>

          {nascent ? (
            <span className="border border-pip px-[5px] py-0.5 font-mono text-[8px] font-bold tracking-[0.1em] text-dim">
              NASCENT
            </span>
          ) : (
            <div className="flex items-center gap-[9px]">
              <Track themeId={theme.id} track="upgrade" marked={theme.upgrade} size="sm" />
              <Track themeId={theme.id} track="decay" marked={theme.decay} size="sm" />
            </div>
          )}
        </div>

        <Link href={href} className="block">
          {title ? (
            <h2
              data-burnt={title.burnt ? "true" : undefined}
              className={`font-display text-[21px] leading-tight font-bold tracking-[0.045em] uppercase ${
                title.burnt ? "line-through" : ""
              } ${
                nascent
                  ? "text-[var(--hue-title)]/60"
                  : "text-[var(--hue-title)] [text-shadow:0_0_20px_color-mix(in_oklab,var(--hue)_38%,transparent)]"
              }`}
            >
              {title.text}
            </h2>
          ) : (
            <h2 className="min-h-11 content-center font-sans text-sm text-dim">No title tag yet.</h2>
          )}
        </Link>

        {/* The artboard draws a nascent card as the header and title alone. */}
        {!nascent && (
          <>
            <ul className="flex flex-wrap gap-1.5">
              {theme.powerTags
                .filter((tag) => tag.id !== theme.titleTagId)
                .map((tag) => (
                  <Chip
                    key={tag.id}
                    label={tagLabel(tag, "power")}
                    text={tag.text}
                    burnt={tag.burnt}
                    burnValue={tag.burnValue}
                  />
                ))}

              {theme.weaknessTags.map((tag) => (
                <Chip key={tag.id} label={tagLabel(tag, "weakness")} text={tag.text} negative />
              ))}
            </ul>

            {theme.quote.trim() && (
              <div className="flex items-baseline gap-[7px] pt-0.5">
                <span className="shrink-0 font-mono text-[8px] font-bold tracking-[0.14em] text-faint uppercase">
                  {themeLine(theme.type)}
                </span>
                <span className="font-sans text-[12.5px] text-quiet italic">{theme.quote}</span>
              </div>
            )}

            {/* The artboard predates the specials list, the decay warning, and
                the lose-theme button, so they run after the quote line. */}
            {theme.specials.length > 0 && (
              <ul className="flex flex-col gap-1">
                {theme.specials.map((special, index) => (
                  <li key={index} className="font-sans text-[13px] text-dim">
                    {specialName(special)}
                  </li>
                ))}
              </ul>
            )}

            {decayFull(theme) && (
              <>
                <DecayWarning />
                <LoseTheme themeId={theme.id} named={title?.text.trim() || "this theme"} />
              </>
            )}
          </>
        )}
      </div>
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

        <ul className="flex flex-wrap gap-1.5">
          {theme.powerTags.map((tag) => (
            <Chip
              key={tag.id}
              label={tagLabel(tag, "power")}
              text={tag.text}
              burnt={tag.burnt}
              burnValue={tag.burnValue}
            />
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

// Not a control, so unlike Track's pips this carries no 44px target of its own.
function Chip({
  label,
  text,
  burnt,
  burnValue,
  negative,
}: {
  label: string;
  text: string;
  burnt?: boolean;
  burnValue?: number;
  negative?: boolean;
}) {
  return (
    <li
      data-burnt={burnt ? "true" : undefined}
      data-valence={negative ? "negative" : undefined}
      className={`flex items-center gap-[7px] rounded-sm border px-[9px] py-1.5 ${
        burnt
          ? "border-dashed border-pip bg-[repeating-linear-gradient(135deg,transparent_0_4px,rgba(255,255,255,.025)_4px_8px)]"
          : "border-[var(--hue)]/32 bg-[var(--hue)]/7"
      }`}
    >
      <span
        className={`font-mono text-[9px] font-bold ${burnt ? "text-faint" : "text-[var(--hue)]/80"}`}
      >
        {label}
      </span>
      <span
        className={`font-display text-[13px] ${burnt ? "text-muted line-through" : "text-[var(--hue-text)]"}`}
      >
        {text}
      </span>
      {burnt && (
        <span className="bg-badge text-burnt px-1 py-0.5 font-mono text-[8px] font-bold tracking-[0.08em]">
          BURNT {burnValue ?? DEFAULT_BURN_VALUE}P
        </span>
      )}
    </li>
  );
}
