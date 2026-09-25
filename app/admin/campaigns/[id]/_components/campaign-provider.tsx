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
import { migrate } from "@/app/admin/campaigns/_lib/migrate";
import {
	type CampaignAction,
	reduce,
} from "@/app/admin/campaigns/_lib/reducer";
import type { Campaign } from "@/app/admin/campaigns/_lib/types";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { resolve, type Scheduler, scheduler } from "@/lib/character/autosave";
import { createClient } from "@/lib/supabase/client";
import { parkLocal, readLocal, writeLocal } from "../_lib/autosave";
import { Side } from "./conflict-side";

export type SaveStatus = "saved" | "saving" | "offline" | "conflict";

export const CampaignContext = createContext<{
	campaign: Campaign;
	dispatch: (action: CampaignAction) => void;
	status: SaveStatus;
	/** The storage key a conflict parked the copy that was not kept under, so
	 *  the screen can say where it is. Null once nothing is parked. */
	parked: string | null;
} | null>(null);

const SAVE_DELAY = 800;

export const SAVE_STATUS_MESSAGE: Record<SaveStatus, string> = {
	saved: "Saved",
	saving: "Saving",
	offline: "Offline. Your edits are kept on this device.",
	conflict: "This campaign changed on another device.",
};

type Conflict = {
	mine: Campaign;
	mineAt: string;
	theirs: Campaign;
	theirsAt: string;
	theirVersion: number;
};

type Props = {
	id: string;
	document: Campaign;
	version: number;
	updatedAt: string;
	children: React.ReactNode;
};

/**
 * Campaign's version of app/character/[id]/_components/layout/character-provider.tsx:
 * same reducer + autosave shape (sysdesign 14), minus what only a phone sheet
 * needs (bar/topBar slots, the sticky footer). The campaign screen is
 * desktop-only (PRD 8), so the save status renders in RosterAppBar instead.
 */
export function CampaignProvider({
	id,
	document: server,
	version,
	updatedAt,
	children,
}: Props) {
	const [campaign, dispatch] = useReducer(reduce, server);
	const [status, setStatus] = useState<SaveStatus>("saved");
	const [conflict, setConflict] = useState<Conflict | null>(null);
	const [parked, setParked] = useState<string | null>(null);

	const campaignRef = useRef(campaign);
	const versionRef = useRef(version);
	const statusRef = useRef<SaveStatus>("saved");
	const handled = useRef(campaign);
	const hydrated = useRef(false);

	const show = useCallback((next: SaveStatus) => {
		statusRef.current = next;
		setStatus(next);
	}, []);

	const save = useCallback(async () => {
		const snapshot = campaignRef.current;
		show("saving");

		const supabase = createClient();
		const { data, error } = await supabase
			.from("campaigns")
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
				dirty: campaignRef.current !== snapshot,
				savedAt: new Date().toISOString(),
				document: campaignRef.current,
			});
			show("saved");
			return;
		}

		const { data: row } = await supabase
			.from("campaigns")
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
		// visibilityState, not a focus event: a backgrounded tab does not fire
		// blur, and pagehide alone misses a tab switch.
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
			// so the effect below schedules the save they never got. A clean copy
			// (newer than a cached page) is already saved: mark it handled, as
			// keepTheirs does, so it is not written back.
			if (!local.dirty) handled.current = local.document;
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
		campaignRef.current = campaign;
		if (handled.current === campaign) return;
		handled.current = campaign;

		writeLocal(id, {
			version: versionRef.current,
			dirty: true,
			savedAt: new Date().toISOString(),
			document: campaign,
		});
		saver.current?.schedule();
	}, [campaign, id]);

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
		() => ({ campaign, dispatch, status, parked }),
		[campaign, status, parked],
	);

	return (
		<CampaignContext.Provider value={value}>
			{children}

			<ConfirmDialog
				open={conflict !== null}
				onOpenChange={(open, eventDetails) => {
					if (!open) eventDetails.cancel();
				}}
				title="Two versions of this campaign"
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
		</CampaignContext.Provider>
	);
}
