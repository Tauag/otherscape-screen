"use client";

import { useActionState, useId, useRef, useState } from "react";
import {
  createCharacter,
  deleteCharacter,
  duplicateCharacter,
  renameCharacter,
} from "@/app/actions";

const action =
  "inline-flex min-h-11 min-w-11 items-center justify-center px-2 font-mono text-[10px] tracking-[0.08em] text-dim uppercase";

type CardProps = {
  id: string;
  name: string;
  essence: string;
  shared: boolean;
  /** ISO 8601, for the machine-readable <time>. */
  updatedAt: string;
  /** Formatted on the server, so the client never recomputes it. */
  edited: string;
};

export function CharacterCard({ id, name, essence, shared, updatedAt, edited }: CardProps) {
  const [renaming, setRenaming] = useState(false);
  const [renameError, rename, renamePending] = useActionState(renameCharacter, null);
  const [copyError, copy, copyPending] = useActionState(duplicateCharacter, null);
  const [deleteError, remove, deletePending] = useActionState(deleteCharacter, null);
  const dialog = useRef<HTMLDialogElement>(null);
  const headingId = useId();

  const label = name.trim() || "Unnamed";
  const busy = renamePending || copyPending || deletePending;
  const error = renameError ?? copyError ?? deleteError;

  return (
    <article className="flex flex-col gap-[11px] rounded-md border border-border bg-surface px-[15px] py-[14px]">
      <div className="flex items-start justify-between gap-3">
        {renaming ? (
          <form
            className="flex flex-1 items-center gap-2"
            onKeyDown={(event) => event.key === "Escape" && setRenaming(false)}
            action={(form) => {
              setRenaming(false);
              rename(form);
            }}
          >
            <input type="hidden" name="id" value={id} />
            <input
              autoFocus
              name="name"
              defaultValue={name}
              aria-label="Character name"
              className="min-h-11 w-full rounded-sm border border-border bg-bg px-2 font-display text-[19px] font-bold tracking-[0.05em]"
            />
            <button type="submit" className={action}>
              Save
            </button>
          </form>
        ) : (
          <h2
            className={`font-display text-[21px] leading-tight font-bold tracking-[0.05em] uppercase ${name.trim() ? "text-text" : "text-dim"}`}
          >
            {label}
          </h2>
        )}

        {shared && (
          <span className="flex shrink-0 items-center gap-1 rounded-[3px] border border-border px-1.5 py-0.5 font-mono text-[9px] tracking-[0.08em] text-positive-text uppercase">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth={2.5}
              strokeLinecap="round"
              className="size-2.5 stroke-positive"
            >
              <path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
              <path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
            </svg>
            Shared
          </span>
        )}
      </div>

      <p className="font-display text-[11px] font-semibold tracking-[0.16em] text-dim uppercase">
        {essence || "Essence not set"}
      </p>

      <div className="flex items-center justify-between gap-2 border-t border-border">
        <p className="font-sans text-[11.5px] text-faint">
          Edited <time dateTime={updatedAt}>{edited}</time>
        </p>

        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setRenaming(true)}
            aria-label={`Rename ${label}`}
            className={action}
          >
            Rename
          </button>

          <form action={copy}>
            <input type="hidden" name="id" value={id} />
            <button type="submit" aria-label={`Duplicate ${label}`} className={action}>
              Copy
            </button>
          </form>

          <button
            type="button"
            onClick={() => dialog.current?.showModal()}
            aria-label={`Delete ${label}`}
            className={action}
          >
            Delete
          </button>
        </div>
      </div>

      <p
        role="status"
        className={`font-sans text-[11px] ${error ? "text-negative-text" : "text-dim"}`}
      >
        {busy ? "Working" : (error ?? "")}
      </p>

      {/* lazy: the native dialog gives the focus trap, the backdrop, and Escape
          dismissal for free. Ceiling: showModal is all it gives. Upgrade path:
          @base-ui/react Dialog when a dialog needs more than that. */}
      <dialog
        ref={dialog}
        aria-labelledby={headingId}
        className="m-auto w-[85vw] max-w-[320px] rounded-md border border-border bg-surface p-5 text-text backdrop:bg-bg/80"
      >
        <h3
          id={headingId}
          className="font-display text-base font-bold tracking-[0.08em] uppercase"
        >
          Delete {label}?
        </h3>
        <p className="mt-2 font-sans text-sm text-dim">
          The character and its sheet go for good. This cannot be undone.
        </p>

        <div className="mt-5 flex items-center justify-end gap-2">
          <form method="dialog">
            <button
              type="submit"
              className="inline-flex min-h-11 items-center rounded-sm border border-border px-4 font-display text-sm font-semibold tracking-[0.08em] uppercase"
            >
              Cancel
            </button>
          </form>

          <form action={remove} onSubmit={() => dialog.current?.close()}>
            <input type="hidden" name="id" value={id} />
            <button
              type="submit"
              className="inline-flex min-h-11 items-center rounded-sm bg-negative px-4 font-display text-sm font-bold tracking-[0.08em] text-bg uppercase"
            >
              Delete
            </button>
          </form>
        </div>
      </dialog>
    </article>
  );
}

export function NewCharacterBar() {
  const [error, create, pending] = useActionState<string | null, FormData>(createCharacter, null);

  return (
    <form action={create}>
      {/* clip-path cuts the box-shadow too, so the glow is a drop-shadow on the
          wrapper, which follows the clipped shape. */}
      <div
        style={{
          filter: "drop-shadow(0 0 14px color-mix(in srgb, var(--color-primary) 35%, transparent))",
        }}
      >
        <button
          type="submit"
          disabled={pending}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-[5px] bg-primary font-display text-base font-bold tracking-[0.12em] text-bg uppercase [clip-path:polygon(0_0,100%_0,100%_72%,95%_100%,0_100%)]"
        >
          <span aria-hidden="true" className="text-xl leading-none">
            +
          </span>
          New character
        </button>
      </div>

      <p
        role="status"
        className={`pt-1 text-center font-sans text-[11px] ${error ? "text-negative-text" : "text-dim"}`}
      >
        {pending ? "Creating" : (error ?? "")}
      </p>
    </form>
  );
}
