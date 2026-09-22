"use client";

import {
	createContext,
	useCallback,
	useEffect,
	useMemo,
	useReducer,
	useRef,
	useState,
} from "react";
import { ConfirmDialog } from "@/app/character/[id]/_components/confirm-dialog";
import {
	parkLocal,
	readLocal,
	resolve,
	type Scheduler,
	scheduler,
	writeLocal,
} from "@/lib/character/autosave";
import { migrate } from "@/lib/character/migrate";
import type { Character } from "@/lib/character/types";
import { createClient } from "@/lib/supabase/client";
import { type CharacterAction, reduce } from "../_lib/reducer";
import { AppBar } from "./app-bar";
import { Side } from "./conflict-side";

export type SaveStatus = "saved" | "saving" | "offline" | "conflict";

export const CharacterContext = createContext<{
	character: Character;
	dispatch: (action: CharacterAction) => void;
	status: SaveStatus;
	shareToken: string | null;
} | null>(null);

const SAVE_DELAY = 800;

/** The save status line, shared by the phone's sticky footer and the board's
 *  app bar (design.md 5: "Save status leaves the bottom of the page"). */
export const SAVE_STATUS_MESSAGE: Record<SaveStatus, string> = {
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
	shareToken: string | null;
	/** The tab bar, built by the layout. One sticky element holds both, so the
	 *  save line and the bar cannot pin to the same edge and overlap. */
	bar: React.ReactNode;
	/** The board's app bar, built by the layout. It lives outside this file so
	 *  it can read SAVE_STATUS_MESSAGE without an import cycle. */
	topBar: React.ReactNode;
	children: React.ReactNode;
};

export function CharacterProvider({
	id,
	document: server,
	version,
	updatedAt,
	shareToken,
	bar,
	topBar,
	children,
}: Props) {
	const [character, dispatch] = useReducer(reduce, server);
	const [status, setStatus] = useState<SaveStatus>("saved");
	const [conflict, setConflict] = useState<Conflict | null>(null);
	const [parked, setParked] = useState<string | null>(null);

	const characterRef = useRef(character);
	const versionRef = useRef(version);
	const statusRef = useRef<SaveStatus>("saved");
	const handled = useRef(character);
	const hydrated = useRef(false);

	const show = useCallback((next: SaveStatus) => {
		statusRef.current = next;
		setStatus(next);
	}, []);

	const save = useCallback(async () => {
		const snapshot = characterRef.current;
		show("saving");

		const supabase = createClient();
		const { data, error } = await supabase
			.from("characters")
			.update({ data: snapshot })
			.eq("id", id)
			.eq("version", versionRef.current)
			.select("version")
			.overrideTypes<{ version: number }[], { merge: false }>();

		if (error) {
			show("offline");
			return;
		}

		if (data.length > 0) {
			versionRef.current = data[0].version;
			writeLocal(id, {
				version: data[0].version,
				dirty: characterRef.current !== snapshot,
				savedAt: new Date().toISOString(),
				document: characterRef.current,
			});
			show("saved");
			return;
		}

		const { data: row } = await supabase
			.from("characters")
			.select("data, version, updated_at")
			.eq("id", id)
			.maybeSingle()
			.overrideTypes<
				{ data: unknown; version: number; updated_at: string },
				{ merge: false }
			>();

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
			setParked(
				parkLocal(id, {
					version: versionRef.current,
					dirty: true,
					savedAt: now,
					document: snapshot,
				}),
			);
		}
		show("conflict");
	}, [id, show]);

	const saveRef = useRef(save);
	useEffect(() => {
		saveRef.current = save;
	}, [save]);

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

	function dismiss() {
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

	const value = useMemo(
		() => ({ character, dispatch, status, shareToken }),
		[character, status, shareToken],
	);

	return (
		<CharacterContext.Provider value={value}>
			{/* lg: the app bar is fixed and the page scrolls under it, so the
			    board's own panes keep the full row height. Phone keeps the
			    document scroll, which the sticky bar and footer pin against. */}
			<div className="flex flex-1 flex-col lg:h-dvh lg:min-h-0 lg:flex-none lg:overflow-hidden">
				<AppBar shareToken={shareToken} />
				{topBar}

				<div className="contents lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:overflow-y-auto">
					{children}
				</div>

				{/* The board (lg:) carries its own save line in its own app bar, so this
				    phone-only footer hides there instead of stacking a second one. */}
				<div className="relative sticky bottom-0 mx-auto w-full max-w-md bg-bg pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
					<div
						aria-hidden="true"
						className="pointer-events-none absolute inset-x-0 bottom-full h-[46px] bg-gradient-to-b from-transparent to-bg"
					/>

					<div className="px-5">
						<p
							role="status"
							aria-live="polite"
							className={`font-mono text-[11px] tracking-[0.08em] ${
								status === "conflict" ? "text-negative-text" : "text-faint"
							}`}
						>
							{SAVE_STATUS_MESSAGE[status]}
						</p>

						{parked && (
							<p className="pt-1 font-sans text-[11px] text-dim">
								The copy you did not keep stays in this browser, under the
								storage key{" "}
								<code className="font-mono text-faint">{parked}</code>.
							</p>
						)}
					</div>

					{bar}
				</div>
			</div>

			<ConfirmDialog
				open={conflict !== null}
				onOpenChange={(open, eventDetails) => {
					if (!open) eventDetails.cancel();
				}}
				title="Two versions of this character"
				description="Another device saved while you were editing. Read both, then choose. Nothing is thrown away: the copy you do not keep stays in this browser."
				cancelLabel={null}
			>
				{conflict && (
					<>
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
					</>
				)}
			</ConfirmDialog>
		</CharacterContext.Provider>
	);
}
