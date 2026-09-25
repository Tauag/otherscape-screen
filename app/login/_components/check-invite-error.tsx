"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Supabase Auth reports a failure from the invite-rejection trigger as a
// hash fragment (#error=...) on the redirect back to /auth/callback, since
// it happens before a code is issued. Fragments never reach the server, so
// the callback route handler can't see it and falls back here with the
// fragment still attached.
export function CheckInviteError() {
	const router = useRouter();

	useEffect(() => {
		const hash = window.location.hash;
		if (!hash) return;

		const params = new URLSearchParams(hash.slice(1));
		const description = params.get("error_description") ?? "";
		if (
			params.get("error") &&
			/database error saving new user/i.test(description)
		) {
			router.replace("/not-invited");
		}
	}, [router]);

	return null;
}
