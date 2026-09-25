// The parts of autosave that do not need React: the debounce-and-flush
// scheduler, the per-document localStorage entry, and the rule that decides
// whether the browser's copy or the server's copy wins on mount.
//
// Generic over the document type and its localStorage key prefix, so
// app/admin/campaigns/_lib/autosave.ts reuses this same engine for Campaign
// instead of forking a copy - the debounce, park, and conflict logic never
// look at the document's shape.

import { migrate } from "./migrate.ts";
import type { Character } from "./types.ts";

/**
 * One document's copy in this browser. `version` is the server version the
 * document is based on, so a save made after an offline reload still carries
 * the right optimistic-concurrency filter.
 *
 * Defaults to `Character` so existing call sites, and this file's own test,
 * keep working unparameterized.
 */
export type LocalEntry<T = Character> = {
	version: number;
	/** True while the document holds edits the server has not confirmed. */
	dirty: boolean;
	/** ISO 8601, so the conflict prompt can say when each copy was touched. */
	savedAt: string;
	document: T;
};

/**
 * The localStorage read/write/park trio, bound to one document type, key
 * prefix, and `migrate` function. `migrate` is the trust boundary: a stale or
 * hand-edited entry that does not parse as `T` is discarded rather than
 * handed to the reducer.
 */
export function createAutosave<T>(
	prefix: string,
	migrateDoc: (doc: unknown) => T,
) {
	const localKey = (id: string) => `${prefix}:${id}`;

	/** Every key a conflict parks a copy under starts with this. */
	const parkedKeyPrefix = (id: string) => `${localKey(id)}:kept`;

	function readLocal(id: string): LocalEntry<T> | null {
		const raw = readRaw(localKey(id));
		if (raw === null) return null;

		try {
			const entry: unknown = JSON.parse(raw);
			if (typeof entry !== "object" || entry === null) return null;
			const { version, dirty, savedAt, document } = entry as Record<
				string,
				unknown
			>;
			if (typeof version !== "number" || typeof dirty !== "boolean")
				return null;
			return {
				version,
				dirty,
				savedAt:
					typeof savedAt === "string" ? savedAt : new Date(0).toISOString(),
				document: migrateDoc(document),
			};
		} catch {
			return null;
		}
	}

	const writeLocal = (id: string, entry: LocalEntry<T>) =>
		writeRaw(localKey(id), entry);

	/**
	 * Keep the copy a conflict did not choose, so resolving never destroys an
	 * edit. Each park gets its own key: a second conflict must not overwrite
	 * what the player was told was safe. Returns the key written, or null if
	 * the write failed, so the screen names the copy that is really there.
	 *
	 * lazy: nothing prunes parked copies. Ceiling: a player who conflicts over
	 * and over fills the origin's storage quota, after which writeRaw fails
	 * silently. Upgrade path: keep the newest few and drop the rest on write.
	 */
	function parkLocal(id: string, entry: LocalEntry<T>): string | null {
		const key = `${parkedKeyPrefix(id)}:${Date.now()}`;
		return writeRaw(key, entry) ? key : null;
	}

	return { localKey, parkedKeyPrefix, readLocal, writeLocal, parkLocal };
}

function writeRaw(key: string, entry: unknown): boolean {
	try {
		localStorage.setItem(key, JSON.stringify(entry));
		return true;
	} catch {
		// Private mode, or the quota is full. Losing the offline copy must not
		// break the screen, and the server save is still the record.
		return false;
	}
}

function readRaw(key: string): string | null {
	try {
		return localStorage.getItem(key);
	} catch {
		return null;
	}
}

const character = createAutosave<Character>("otherscape:character", migrate);
export const localKey = character.localKey;
export const parkedKeyPrefix = character.parkedKeyPrefix;
export const readLocal = character.readLocal;
export const writeLocal = character.writeLocal;
export const parkLocal = character.parkLocal;

/**
 * Which copy the provider starts from.
 *
 * - No local copy, or a clean one at or behind the server's version: take the server's.
 * - Clean but newer: the server read is stale (a page the service worker
 *   cached before the last save). Take the local copy.
 * - Dirty and based on the version the server still holds (or newer, if the
 *   read was stale): the local copy carries edits the server never saw. Take it.
 * - Dirty but based on an older version: another device saved in between. Both
 *   copies hold real edits, so neither is discarded and the player chooses.
 */
export function resolve<T = Character>(
	local: LocalEntry<T> | null,
	remoteVersion: number,
): "local" | "remote" | "conflict" {
	if (!local) return "remote";
	if (!local.dirty) return local.version > remoteVersion ? "local" : "remote";
	return local.version >= remoteVersion ? "local" : "conflict";
}

export type Scheduler = {
	/** Push the pending run out to `delay` from now. */
	schedule: () => void;
	/** Run a pending call now. Does nothing when none is pending. */
	flush: () => void;
	cancel: () => void;
};

export function scheduler(run: () => void, delay: number): Scheduler {
	let timer: ReturnType<typeof setTimeout> | null = null;

	const cancel = () => {
		if (timer === null) return;
		clearTimeout(timer);
		timer = null;
	};

	return {
		schedule() {
			cancel();
			timer = setTimeout(() => {
				timer = null;
				run();
			}, delay);
		},
		flush() {
			if (timer === null) return;
			cancel();
			run();
		},
		cancel,
	};
}
