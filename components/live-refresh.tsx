"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { scheduler } from "@/lib/character/autosave";
import { createClient } from "@/lib/supabase/client";

const REFRESH_DELAY = 1000;

/** Re-renders the route's server components when a character ping arrives on
 *  any of `topics` (`character:<id>` or `share:<token>`, sent by the
 *  characters_notify_changed trigger). Renders nothing. */
export function LiveRefresh({ topics }: { topics: string[] }) {
	const router = useRouter();
	// A string, so a new array with the same topics does not resubscribe.
	const key = topics.join(" ");

	useEffect(() => {
		const supabase = createClient();
		// Coalesce a burst of pings (several players saving at once) into one
		// refresh. Scheduled only when idle, so a steady stream still refreshes
		// once per REFRESH_DELAY instead of being pushed back forever.
		const pending = scheduler(() => router.refresh(), REFRESH_DELAY);
		const refresh = () => {
			if (!pending.pending()) pending.schedule();
		};

		const channels = key
			.split(" ")
			.filter(Boolean)
			.map((topic) => {
				let joined = false;
				return supabase
					.channel(topic)
					.on("broadcast", { event: "changed" }, refresh)
					.subscribe((status) => {
						if (status !== "SUBSCRIBED") return;
						// A rejoin after a dropped socket: pings sent meanwhile are gone.
						if (joined) refresh();
						joined = true;
					});
			});

		// A sleeping phone can miss pings before the socket notices it dropped.
		const onVisibility = () => {
			if (document.visibilityState === "visible") refresh();
		};
		document.addEventListener("visibilitychange", onVisibility);

		return () => {
			document.removeEventListener("visibilitychange", onVisibility);
			pending.cancel();
			for (const channel of channels) void supabase.removeChannel(channel);
		};
	}, [key, router]);

	return null;
}
