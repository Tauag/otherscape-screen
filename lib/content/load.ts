"use client";

import { useEffect, useState } from "react";
import {
	type ContentPack,
	FALLBACK_PACK,
	normalize,
	readCachedPack,
	writeCachedPack,
} from "@/lib/content/pack";
import { createClient } from "@/lib/supabase/client";

const PACK_ID = "themebooks";

let pending: Promise<ContentPack> | null = null;

/** One fetch per page load, however many components ask for the pack. */
export const loadPack = (): Promise<ContentPack> => (pending ??= fetchPack());

/**
 * `updated_at` first, because it is a few bytes and it is the cache key: a pack
 * this browser already holds costs no second query. Anything that goes wrong
 * (no row, no network, unreadable JSON) ends at the fallback, never at an error.
 */
async function fetchPack(): Promise<ContentPack> {
	try {
		const supabase = createClient();
		const { data: row } = await supabase
			.from("content_packs")
			.select("updated_at")
			.eq("id", PACK_ID)
			.maybeSingle()
			.overrideTypes<{ updated_at: string }, { merge: false }>();

		if (!row) return FALLBACK_PACK;

		const cached = readCachedPack(localStorage, row.updated_at);
		if (cached) return cached;

		const { data: full } = await supabase
			.from("content_packs")
			.select("data")
			.eq("id", PACK_ID)
			.maybeSingle()
			.overrideTypes<{ data: unknown }, { merge: false }>();

		const pack = normalize(full?.data);
		if (!pack) return FALLBACK_PACK;

		writeCachedPack(localStorage, row.updated_at, full?.data);
		return pack;
	} catch {
		return FALLBACK_PACK;
	}
}

/** Renders with empty text for one frame, then with the pack. Never suspends, never throws. */
export function useContentPack(): ContentPack {
	const [pack, setPack] = useState(FALLBACK_PACK);

	useEffect(() => {
		let live = true;
		loadPack().then((loaded) => {
			if (live) setPack(loaded);
		});
		return () => {
			live = false;
		};
	}, []);

	return pack;
}
