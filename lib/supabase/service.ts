import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "@/lib/supabase/env";

/**
 * Bypasses RLS. Server-only: call it after the caller's own client has already
 * proved access, and never pass its results to the browser.
 */
export function createServiceClient() {
	const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
	if (!key)
		throw new Error("Missing required env var: SUPABASE_SERVICE_ROLE_KEY");
	return createClient(supabaseUrl, key, { auth: { persistSession: false } });
}
