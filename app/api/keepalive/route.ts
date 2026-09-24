import { createClient } from "@supabase/supabase-js";
import { supabaseKey, supabaseUrl } from "@/lib/supabase/env";

// Called daily by netlify/functions/keepalive.ts so the free Supabase project
// never pauses. A plain anon client, not the cookie one: the cron has no session,
// and a signed-in caller would run as `authenticated`, which has no grant.
export async function GET(request: Request) {
	const secret = process.env.CRON_SECRET;
	if (secret && request.headers.get("authorization") !== `Bearer ${secret}`)
		return new Response("Unauthorized", { status: 401 });

	const supabase = createClient(supabaseUrl, supabaseKey, {
		auth: { persistSession: false },
	});
	const { error } = await supabase.rpc("keepalive");
	if (error) return Response.json({ error: error.message }, { status: 500 });
	return new Response("ok");
}
