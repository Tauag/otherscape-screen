import { createClient } from "@supabase/supabase-js";
import { supabaseKey, supabaseUrl } from "@/lib/supabase/env";

// Public uptime-monitor target. Reuses the anon-granted keepalive rpc to prove
// the database answers, and leaks no detail on failure.
export const dynamic = "force-dynamic";

export async function GET() {
	try {
		const supabase = createClient(supabaseUrl, supabaseKey, {
			auth: { persistSession: false },
		});
		const { error } = await supabase
			.rpc("keepalive")
			.abortSignal(AbortSignal.timeout(5000));
		if (error) throw error;
		return Response.json(
			{ ok: true },
			{ headers: { "Cache-Control": "no-store" } },
		);
	} catch (error) {
		console.error("health check failed", error);
		return Response.json(
			{ ok: false },
			{ status: 503, headers: { "Cache-Control": "no-store" } },
		);
	}
}
