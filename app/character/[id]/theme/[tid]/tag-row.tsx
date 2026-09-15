import Link from "next/link";
import { BurnButton, LABEL } from "@/app/character/[id]/parts";
import { useCharacter } from "@/app/character/[id]/provider";
import type { MoveDirection, TagKind } from "@/lib/character/theme";
import type { PowerQuestionLetter, WeaknessQuestionLetter } from "@/lib/character/types";
import { tagLabel } from "@/lib/tag-label";

const ICON =
  "grid size-11 shrink-0 place-items-center rounded-sm border border-border text-base disabled:opacity-30";

type RowTag = {
  id: string;
  letter: PowerQuestionLetter | WeaknessQuestionLetter;
  text: string;
  themebook?: string;
  burnt?: boolean;
};

export function TagRow({
  kind,
  themeId,
  tag,
  href,
  index,
  count,
  isTitle,
  themeThemebook,
}: {
  kind: TagKind;
  themeId: string;
  tag: RowTag;
  /** The question picker for this tag. */
  href: string;
  index: number;
  count: number;
  /** Power tags only: this tag is the one drawn as the theme's title. */
  isTitle?: boolean;
  /** Power tags only: the themebook a tag falls back to when it borrows none. */
  themeThemebook?: string;
}) {
  const { dispatch } = useCharacter();

  const label = tagLabel(tag, kind);
  const named = tag.text.trim() || `the blank ${label} tag`;
  const power = kind === "power";

  function setText(text: string) {
    dispatch(
      power
        ? { type: "editPowerTag", themeId, tagId: tag.id, edit: { text } }
        : { type: "editWeaknessTag", themeId, tagId: tag.id, edit: { text } },
    );
  }

  function move(event: React.MouseEvent<HTMLButtonElement>, direction: MoveDirection) {
    const to = direction === "up" ? index - 1 : index + 1;
    if (to === 0 || to === count - 1) {
      const twin =
        direction === "up"
          ? event.currentTarget.nextElementSibling
          : event.currentTarget.previousElementSibling;
      if (twin instanceof HTMLElement) twin.focus();
    }
    dispatch({ type: "moveTag", themeId, kind, tagId: tag.id, direction });
  }

  return (
    <li
      data-burnt={tag.burnt ? "true" : undefined}
      data-valence={power ? undefined : "negative"}
      className="flex flex-col gap-1.5 border-l-2 border-[var(--hue)] pl-2"
    >
      <div className="flex items-center gap-2">
        {/* The letter is the way in to the question picker, which is where the
            question text is long enough to read. */}
        <Link
          href={href}
          aria-label={`Question ${label} for ${named}`}
          className="grid size-11 shrink-0 place-items-center rounded-sm border border-border bg-bg font-mono text-[13px] text-[var(--hue)]"
        >
          {label}
        </Link>

        {/* Burnt reads as struck through as well as achromatic, so the state does
            not rest on colour alone. T26 owns the control that sets it. */}
        <input
          type="text"
          value={tag.text}
          onChange={(event) => setText(event.target.value)}
          aria-label={`${power ? "Power" : "Weakness"} tag ${label}`}
          placeholder="Answer the question"
          className={`min-h-11 min-w-32 flex-1 rounded-sm border border-border bg-bg px-3 font-display text-[15px] tracking-[0.03em] text-[var(--hue-text)] ${
            tag.burnt ? "line-through" : ""
          }`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-1">
        {power && (
          <input
            type="text"
            value={tag.themebook ?? ""}
            onChange={(event) =>
              dispatch({
                type: "editPowerTag",
                themeId,
                tagId: tag.id,
                edit: { themebook: event.target.value },
              })
            }
            placeholder={themeThemebook}
            aria-label={`Themebook ${named} answers`}
            className="min-h-11 min-w-32 flex-1 rounded-sm border border-border bg-bg px-3 font-sans text-[13px] text-dim"
          />
        )}

        {power && (
          <label className="flex min-h-11 items-center gap-1.5 px-1.5">
            <input
              type="radio"
              name="title-tag"
              checked={isTitle ?? false}
              onChange={() => dispatch({ type: "setTitleTag", themeId, tagId: tag.id })}
              className="size-[18px] accent-[var(--hue)]"
            />
            <span className={LABEL}>Title</span>
          </label>
        )}

        {/* lazy: burning is reached from this screen only. Ceiling: a player
            mid-roll leaves the roll to burn a tag. Upgrade path: S7's roll
            builder burns the tag it has already selected. */}
        {power && (
          <BurnButton themeId={themeId} tagId={tag.id} burnt={tag.burnt ?? false} named={named} />
        )}

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            disabled={index === 0}
            onClick={(event) => move(event, "up")}
            aria-label={`Move ${named} up`}
            className={ICON}
          >
            ↑
          </button>
          <button
            type="button"
            disabled={index === count - 1}
            onClick={(event) => move(event, "down")}
            aria-label={`Move ${named} down`}
            className={ICON}
          >
            ↓
          </button>
          <button
            type="button"
            onClick={() =>
              dispatch(
                power
                  ? { type: "deletePowerTag", themeId, tagId: tag.id }
                  : { type: "deleteWeaknessTag", themeId, tagId: tag.id },
              )
            }
            aria-label={`Delete ${named}`}
            className={ICON}
          >
            ✕
          </button>
        </div>
      </div>
    </li>
  );
}
