type Props = {
  label: string;
  text: string;
  burnt?: boolean;
  negative?: boolean;
};

export function Chip({ label, text, burnt, negative }: Props) {
  return (
    <li
      data-burnt={burnt ? "true" : undefined}
      data-valence={negative ? "negative" : undefined}
      className="flex min-h-11 items-center gap-2 border-l-2 border-[var(--hue)] pl-2"
    >
      <span className="font-mono text-[10px] text-[var(--hue)]">{label}</span>
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
