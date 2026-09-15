"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import {
  parkLocal,
  readLocal,
  resolve,
  scheduler,
  writeLocal,
  type Scheduler,
} from "@/lib/character/autosave";
import { migrate } from "@/lib/character/migrate";
import type { Character } from "@/lib/character/types";
import { createClient } from "@/lib/supabase/client";

/**
 * Domain verbs, never generic setters. A new verb is one more case below, so
 * S3 to S7 add burnTag, markUpgrade, raiseStatus and loseTheme here without a
 * refactor. `replace` is the exception: it is how a whole document arrives,
 * from the offline copy on mount or from a resolved conflict.
 */
export type CharacterAction =
  | { type: "replace"; document: Character }
  | { type: "rename"; name: string }
  | { type: "setPlayerName"; playerName: string };

function reduce(character: Character, action: CharacterAction): Character {
  switch (action.type) {
    case "replace":
      return action.document;
    case "rename":
      return { ...character, name: action.name };
    case "setPlayerName":
      return { ...character, playerName: action.playerName };
  }
}

const Context = createContext<{
  character: Character;
  dispatch: (action: CharacterAction) => void;
} | null>(null);

export function useCharacter() {
  const value = useContext(Context);
  if (!value) throw new Error("useCharacter needs a CharacterProvider above it.");
  return value;
}

const SAVE_DELAY = 800;

type SaveStatus = "saved" | "saving" | "offline" | "conflict";

const message: Record<SaveStatus, string> = {
  saved: "Saved",
  saving: "Saving",
  offline: "Offline. Your edits are kept on this device.",
  conflict: "This character changed on another device.",
};

type Conflict = {
  mine: Character;
  mineAt: string;
  theirs: Character;
  theirsAt: string;
  theirVersion: number;
};

type Props = {
  id: string;
  document: Character;
  version: number;
  updatedAt: string;
  children: React.ReactNode;
};

export function CharacterProvider({ id, document: server, version, updatedAt, children }: Props) {
  const [character, dispatch] = useReducer(reduce, server);
  const [status, setStatus] = useState<SaveStatus>("saved");
  const [conflict, setConflict] = useState<Conflict | null>(null);
  // The key of the copy the last conflict parked, so the screen names the
  // copy that is really there.
  const [parked, setParked] = useState<string | null>(null);

  const characterRef = useRef(character);
  const versionRef = useRef(version);
  const statusRef = useRef<SaveStatus>("saved");
  // The last document the dirty effect acted on. Reference equality, because
  // the reducer returns a new object only for a real change.
  const handled = useRef(character);
  const hydrated = useRef(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const headingId = useId();

  const show = useCallback((next: SaveStatus) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  const save = useCallback(async () => {
    const snapshot = characterRef.current;
    show("saving");

    const supabase = createClient();
    // `version` is a filter and never a payload: the column grants forbid
    // writing it, and the trigger owns it. The row it returns is the next
    // base version, so the following save does not conflict with this one.
    const { data, error } = await supabase
      .from("characters")
      .update({ data: snapshot })
      .eq("id", id)
      .eq("version", versionRef.current)
      .select("version")
      .returns<{ version: number }[]>();

    if (error) {
      show("offline");
      return;
    }

    if (data.length > 0) {
      versionRef.current = data[0].version;
      writeLocal(id, {
        version: data[0].version,
        // An edit landed while the save was in flight, so the version is
        // current but the document on screen is not saved yet.
        dirty: characterRef.current !== snapshot,
        savedAt: new Date().toISOString(),
        document: characterRef.current,
      });
      show("saved");
      return;
    }

    // Zero rows: another device saved first. Read what it wrote so the player
    // can compare the two documents.
    const { data: row } = await supabase
      .from("characters")
      .select("data, version, updated_at")
      .eq("id", id)
      .returns<{ data: unknown; version: number; updated_at: string }[]>()
      .maybeSingle();

    if (!row) {
      show("offline");
      return;
    }

    const now = new Date().toISOString();
    try {
      setConflict({
        mine: snapshot,
        mineAt: now,
        theirs: migrate(row.data),
        theirsAt: row.updated_at,
        theirVersion: row.version,
      });
    } catch {
      // A newer build of the app wrote that row, so this one cannot read it.
      // Park the local edits where they survive and stop saving over it.
      setParked(
        parkLocal(id, { version: versionRef.current, dirty: true, savedAt: now, document: snapshot }),
      );
    }
    show("conflict");
  }, [id, show]);

  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  // The scheduler is built in an effect, not in render, because it closes over
  // refs. Declared before the effects that use it, so it exists when they run.
  const saver = useRef<Scheduler | null>(null);
  useEffect(() => {
    const pending = scheduler(() => void saveRef.current(), SAVE_DELAY);
    saver.current = pending;

    const flush = () => pending.flush();
    // visibilityState, not a focus event: a phone backgrounds a tab without
    // firing blur, and pagehide alone misses an app switch.
    const onVisibility = () => {
      if (window.document.visibilityState === "hidden") pending.flush();
    };
    const onOnline = () => {
      if (statusRef.current === "offline") pending.schedule();
    };

    window.addEventListener("pagehide", flush);
    window.addEventListener("online", onOnline);
    window.document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("online", onOnline);
      window.document.removeEventListener("visibilitychange", onVisibility);
      pending.flush();
      saver.current = null;
    };
  }, []);

  // Mount: decide between this browser's copy and the server's. localStorage
  // exists only on the client, so the first render has to be the server
  // document and the browser's copy has to arrive after it.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;

    const local = readLocal(id);
    const choice = resolve(local, version);

    if (!local || choice === "remote") {
      writeLocal(id, {
        version,
        dirty: false,
        savedAt: new Date().toISOString(),
        document: server,
      });
      return;
    }

    versionRef.current = local.version;

    if (choice === "local") {
      // Unsaved edits from an earlier visit. Adopting them leaves them dirty,
      // so the effect below schedules the save they never got.
      dispatch({ type: "replace", document: local.document });
      return;
    }

    setConflict({
      mine: local.document,
      mineAt: local.savedAt,
      theirs: server,
      theirsAt: updatedAt,
      theirVersion: version,
    });
    show("conflict");
  }, [id, server, version, updatedAt, show]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Every dispatch: replace in memory, write localStorage, schedule the save.
  useEffect(() => {
    characterRef.current = character;
    if (handled.current === character) return;
    handled.current = character;

    writeLocal(id, {
      version: versionRef.current,
      dirty: true,
      savedAt: new Date().toISOString(),
      document: character,
    });
    saver.current?.schedule();
  }, [character, id]);

  useEffect(() => {
    if (conflict) dialog.current?.showModal();
  }, [conflict]);

  function dismiss() {
    dialog.current?.close();
    setConflict(null);
  }

  const keepMine = () => {
    if (!conflict) return;
    setParked(
      parkLocal(id, {
        version: conflict.theirVersion,
        dirty: false,
        savedAt: conflict.theirsAt,
        document: conflict.theirs,
      }),
    );
    versionRef.current = conflict.theirVersion;
    // A conflict found on mount leaves the server document on screen, so put
    // the kept one there before rebasing it on the version that beat it.
    dispatch({ type: "replace", document: conflict.mine });
    writeLocal(id, {
      version: conflict.theirVersion,
      dirty: true,
      savedAt: new Date().toISOString(),
      document: conflict.mine,
    });
    dismiss();
    saver.current?.schedule();
  };

  const keepTheirs = () => {
    if (!conflict) return;
    setParked(
      parkLocal(id, {
        version: conflict.theirVersion,
        dirty: true,
        savedAt: conflict.mineAt,
        document: conflict.mine,
      }),
    );
    versionRef.current = conflict.theirVersion;
    // Marked handled before the dispatch, so the dirty effect does not treat
    // an already-saved document as an unsaved edit and write it straight back.
    handled.current = conflict.theirs;
    dispatch({ type: "replace", document: conflict.theirs });
    writeLocal(id, {
      version: conflict.theirVersion,
      dirty: false,
      savedAt: new Date().toISOString(),
      document: conflict.theirs,
    });
    dismiss();
    show("saved");
  };

  const value = useMemo(() => ({ character, dispatch }), [character]);

  return (
    <Context.Provider value={value}>
      {children}

      <div className="sticky bottom-0 mx-auto w-full max-w-md bg-bg px-5 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <p
          role="status"
          aria-live="polite"
          className={`font-mono text-[11px] tracking-[0.08em] ${
            status === "conflict" ? "text-negative-text" : "text-faint"
          }`}
        >
          {message[status]}
        </p>

        {parked && (
          <p className="pt-1 font-sans text-[11px] text-dim">
            The copy you did not keep stays in this browser, under the storage key{" "}
            <code className="font-mono text-faint">{parked}</code>.
          </p>
        )}
      </div>

      {/* lazy: the native dialog gives the focus trap, the backdrop, and Escape
          dismissal for free. Ceiling: showModal is all it gives. Upgrade path:
          @base-ui/react Dialog when a dialog needs more than that. */}
      <dialog
        ref={dialog}
        aria-labelledby={headingId}
        onCancel={(event) => event.preventDefault()}
        className="m-auto w-[90vw] max-w-[420px] rounded-md border border-border bg-surface p-5 text-text backdrop:bg-bg/80"
      >
        <h2 id={headingId} className="font-display text-base font-bold tracking-[0.08em] uppercase">
          Two versions of this character
        </h2>
        <p className="mt-2 font-sans text-sm text-dim">
          Another device saved while you were editing. Read both, then choose. Nothing is thrown
          away: the copy you do not keep stays in this browser.
        </p>

        {conflict && (
          <div className="mt-4 flex flex-col gap-3">
            <Side
              label="On this device"
              document={conflict.mine}
              at={conflict.mineAt}
              action="Keep this one"
              onKeep={keepMine}
            />
            <Side
              label="Saved elsewhere"
              document={conflict.theirs}
              at={conflict.theirsAt}
              action="Keep this one"
              onKeep={keepTheirs}
            />
          </div>
        )}
      </dialog>
    </Context.Provider>
  );
}

function Side({
  label,
  document: value,
  at,
  action,
  onKeep,
}: {
  label: string;
  document: Character;
  at: string;
  action: string;
  onKeep: () => void;
}) {
  const json = JSON.stringify(value, null, 2);

  return (
    <section className="rounded-sm border border-border p-3">
      <p className="font-mono text-[10px] tracking-[0.08em] text-faint uppercase">{label}</p>
      <p className="font-display text-lg font-bold tracking-[0.05em] uppercase">
        {value.name.trim() || "Unnamed"}
      </p>
      <p className="font-sans text-[11.5px] text-dim">
        Edited <time dateTime={at}>{new Date(at).toLocaleString()}</time>
      </p>

      <details className="mt-2">
        <summary className="min-h-11 cursor-pointer content-center font-mono text-[10px] tracking-[0.08em] text-dim uppercase">
          Read it
        </summary>
        <pre className="mt-1 max-h-48 overflow-auto rounded-sm bg-bg p-2 font-mono text-[10px] text-dim">
          {json}
        </pre>
      </details>

      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={onKeep}
          className="inline-flex min-h-11 items-center rounded-sm bg-primary px-4 font-display text-sm font-bold tracking-[0.08em] text-bg uppercase"
        >
          {action}
        </button>
        <button
          type="button"
          onClick={() => void navigator.clipboard?.writeText(json)}
          className="inline-flex min-h-11 items-center rounded-sm border border-border px-4 font-display text-sm font-semibold tracking-[0.08em] uppercase"
        >
          Copy
        </button>
      </div>
    </section>
  );
}
