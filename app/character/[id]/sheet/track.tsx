import { LABEL } from "./label";

type Props = {
  name: string;
  length: number;
  marked: number;
};

export function Track({ name, length, marked }: Props) {
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
