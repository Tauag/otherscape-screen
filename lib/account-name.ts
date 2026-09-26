type NamedAccount = {
	email?: string;
	user_metadata?: Record<string, unknown>;
};

/** Best available label for a signed-in user: OAuth full name, then OAuth
 *  name, then their email. */
export function accountName(user: NamedAccount): string {
	const metadata = user.user_metadata ?? {};
	return (
		[metadata.full_name, metadata.name, user.email].find(
			(value): value is string => typeof value === "string" && value.length > 0,
		) ?? "Account"
	);
}
