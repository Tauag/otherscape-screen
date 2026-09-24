import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Every /admin route needs this. 404s a non-admin rather than redirecting,
 * so the route's existence isn't revealed to a signed-in non-admin either.
 */
export async function requireAdmin() {
	const supabase = await createClient();
	const { data: account } = await supabase.auth.getUser();
	if (!account.user) redirect("/login");

	const { data: isAdmin } = await supabase.rpc("current_user_is_admin");
	if (!isAdmin) notFound();

	return { supabase, user: account.user };
}
