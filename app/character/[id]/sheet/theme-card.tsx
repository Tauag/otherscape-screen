import type { Theme } from "@/lib/character/types";
import { DECAY_TRACK_LENGTH, UPGRADE_TRACK_LENGTH } from "@/lib/rules/constants";
import { tagLabel } from "@/lib/tag-label";
import { Chip } from "./chip";
import { LABEL } from "./label";
import { Track } from "./track";

type Props = { theme: Theme };

export function ThemeCard({ theme }: Props) {
  const title = theme.powerTags.find((tag) => tag.id === theme.titleTagId);

  return (
    <article
      data-type={theme.type}
      className="flex flex-col gap-3 rounded-md border border-border bg-surface p-4"
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className={LABEL}>{theme.themebook.trim() || "No themebook"}</p>
        {theme.nascent && <p className={LABEL}>Nascent</p>}
      </div>

      {title ? (
        <h2 className="font-display text-[21px] leading-tight font-bold tracking-[0.05em] text-[var(--hue-title)] uppercase">
          {title.text}
        </h2>
      ) : (
        <h2 className="font-sans text-sm text-dim">No title tag yet.</h2>
      )}

      <ul className="flex flex-col gap-1.5">
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

      <div className="flex flex-wrap gap-x-4">
        <Track name="Upgrade" length={UPGRADE_TRACK_LENGTH} marked={theme.upgrade} />
        <Track name="Decay" length={DECAY_TRACK_LENGTH} marked={theme.decay} />
      </div>
    </article>
  );
}
