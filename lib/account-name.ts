import type { User } from "@supabase/supabase-js";

/** Best available label for a signed-in user: OAuth full name, then OAuth
 *  name, then their email. */
export function accountName(user: User): string {
	const metadata = user.user_metadata as Record<string, unknown>;
	return (
		[metadata.full_name, metadata.name, user.email].find(
			(value): value is string => typeof value === "string" && value.length > 0,
		) ?? "Account"
	);
}
