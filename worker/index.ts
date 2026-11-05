import handler from "vinext/server/fetch-handler";
import { supabaseKey, supabaseUrl } from "../lib/supabase/env";

export default {
	fetch: handler.fetch,
	// Daily cron: call the anon keepalive rpc so the free Supabase project
	// never pauses.
	async scheduled() {
		const res = await fetch(`${supabaseUrl}/rest/v1/rpc/keepalive`, {
			method: "POST",
			headers: { apikey: supabaseKey, "Content-Type": "application/json" },
			body: "{}",
		});
		// Throwing marks the run failed in the Workers log.
		if (!res.ok) throw new Error(`keepalive failed: ${res.status}`);
	},
};
