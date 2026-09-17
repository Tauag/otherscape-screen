import { createBrowserClient } from "@supabase/ssr";
import { supabaseKey, supabaseUrl } from "@/lib/supabase/env";

// Singleton under the hood; call this wherever a client component needs it.
export function createClient() {
	return createBrowserClient(supabaseUrl, supabaseKey);
}
