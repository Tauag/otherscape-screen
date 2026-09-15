// The pieces the sheet and the theme screen both draw. Neither one learns its
// theme type: `data-type` sits on the screen's root and the hue rides down.

export const LABEL = "font-mono text-[10px] tracking-[0.08em] text-faint uppercase";

// lazy: display only. The boxes reflect the count and nothing more, because T27
// owns marking and clearing a track. Upgrade path: T27 adds the markUpgrade and
// markDecay verbs and drops `disabled`.
export function Track({
  name,
  length,
  marked,
}: {
  name: string;
  length: number;
  marked: number;
}) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label={`${name} track`}>
      <p className={LABEL}>{name}</p>
      {Array.from({ length }, (_, index) => (
        <label key={index} className="grid size-11 place-items-center">
          <input
            type="checkbox"
            checked={index < marked}
            disabled
            className="size-[18px] accent-[var(--hue)]"
          />
          <span className="sr-only">{`${name} ${index + 1} of ${length}`}</span>
        </label>
      ))}
    </div>
  );
}
