import { createClient } from "@supabase/supabase-js";
import { supabaseKey, supabaseUrl } from "../../lib/supabase/env";

// Netlify scheduled function: once a day, call the anon keepalive rpc so the
// free Supabase project never pauses.
export default async () => {
	const supabase = createClient(supabaseUrl, supabaseKey, {
		auth: { persistSession: false },
	});
	const { error } = await supabase.rpc("keepalive");
	// Throwing marks the run failed in the Netlify function log.
	if (error) throw new Error(`keepalive failed: ${error.message}`);
};

export const config = { schedule: "@daily" };
