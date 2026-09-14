const chips = [
  { label: "Self", attr: { "data-type": "self" } },
  { label: "Mythos", attr: { "data-type": "mythos" } },
  { label: "Noise", attr: { "data-type": "noise" } },
  { label: "Positive", attr: { "data-valence": "positive" } },
  { label: "Negative", attr: { "data-valence": "negative" } },
  { label: "Burnt", attr: { "data-burnt": "true" } },
] as const;

export default function Home() {
  return (
    <main className="flex flex-1 flex-wrap items-start gap-3 p-8 font-sans">
      {chips.map(({ label, attr }) => (
        <div
          key={label}
          {...attr}
          className="rounded border px-4 py-2 font-display text-sm font-semibold tracking-wide"
          style={{
            background: "var(--hue)",
            color: "var(--hue-text)",
            borderColor: "var(--hue-text)",
          }}
        >
          {label}
        </div>
      ))}
    </main>
  );
}
