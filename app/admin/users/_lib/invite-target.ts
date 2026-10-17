export type InviteTarget =
	| { kind: "email"; value: string }
	| { kind: "discord"; value: string };

/** Digits only is a Discord ID (a 17-20 digit snowflake). Anything else must look like an email. */
export function parseInviteTarget(input: string): InviteTarget | null {
	const value = input.trim().toLowerCase();
	if (/^\d{17,20}$/.test(value)) return { kind: "discord", value };
	// lazy: shape check only. The sign-in provider proves the real address.
	if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return { kind: "email", value };
	return null;
}
