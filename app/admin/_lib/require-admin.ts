import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Every /admin route needs this. 404s a non-admin rather than redirecting,
 * so the route's existence isn't revealed to a signed-in non-admin either.
 */
export async function requireAdmin() {
	const supabase = await createClient();
	// getClaims, not getUser: matches proxy.ts's check, so this can't disagree
	// with it and redirect-loop.
	const { data: account } = await supabase.auth.getClaims();
	if (!account?.claims) redirect("/login");

	const { data: isAdmin } = await supabase.rpc("current_user_is_admin");
	if (!isAdmin) notFound();

	const { claims } = account;
	const user = {
		id: claims.sub,
		email: claims.email,
		user_metadata: claims.user_metadata,
	};
	return { supabase, user };
}
