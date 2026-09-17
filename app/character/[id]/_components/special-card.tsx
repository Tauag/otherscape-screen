"use client";

import { Button } from "@base-ui/react/button";
import { Collapsible } from "@base-ui/react/collapsible";
import { REMOVE_BUTTON } from "@/app/character/[id]/_components/styles";
import { specialName, specialText } from "@/lib/pickers";

function RemoveButton({ name, onRemove }: { name: string; onRemove: () => void }) {
  return (
    <Button
      type="button"
      onClick={onRemove}
      aria-label={`Remove ${name}`}
      className={`${REMOVE_BUTTON} w-11`}
    >
      ✕
    </Button>
  );
}

/**
 * A special's name always shows; its rule text expands on tap when there is
 * one. The remove button sits beside the trigger, not inside it - a button
 * can't nest inside another button.
 */
export function SpecialCard({
  special,
  onRemove,
}: {
  special: string;
  onRemove?: () => void;
}) {
  const name = specialName(special);
  const text = specialText(special);

  if (!text) {
    return (
      <div className="flex items-stretch rounded-sm border border-border bg-surface">
        <span className="min-h-11 flex-1 content-center px-3 py-2 font-sans text-sm">{name}</span>
        {onRemove && <RemoveButton name={name} onRemove={onRemove} />}
      </div>
    );
  }

  return (
    <Collapsible.Root className="rounded-sm border border-border bg-surface data-[open]:border-[var(--hue)]">
      <div className="flex items-stretch">
        <Collapsible.Trigger className="group flex min-h-11 flex-1 items-center justify-between gap-2 px-3 py-2 text-left font-sans text-sm">
          {name}
          <span
            aria-hidden
            className="shrink-0 text-faint transition-transform group-data-[panel-open]:rotate-180"
          >
            ▾
          </span>
        </Collapsible.Trigger>
        {onRemove && <RemoveButton name={name} onRemove={onRemove} />}
      </div>
      <Collapsible.Panel className="px-3 pb-2.5 font-sans text-[13px] text-dim">
        {text}
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}
