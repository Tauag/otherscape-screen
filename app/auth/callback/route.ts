import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Supabase redirects here with ?code=... after the Google OAuth round trip,
// or with ?error=... if the provider or Supabase Auth rejected the request
// before a code was ever issued (e.g. the redirect URL isn't allow-listed).
export async function GET(request: Request) {
	const { searchParams, origin: requestOrigin } = new URL(request.url);
	// Same Netlify quirk as signInWithGoogle: request.url can reflect the
	// per-deploy alias instead of the public domain, so prefer Netlify's
	// stable site URL and only fall back locally.
	const origin = process.env.URL ?? requestOrigin;
	const code = searchParams.get("code");
	const providerError =
		searchParams.get("error_description") ?? searchParams.get("error");

	if (providerError) {
		console.error("[auth/callback] provider/auth error:", providerError);
		return NextResponse.redirect(`${origin}/login`);
	}

	if (code) {
		const supabase = await createClient();
		const { error } = await supabase.auth.exchangeCodeForSession(code);
		if (!error) {
			return NextResponse.redirect(`${origin}/`);
		}
		console.error(
			"[auth/callback] exchangeCodeForSession failed:",
			error.message,
		);

		// lazy: treat any failure here as the invite trigger rejecting the
		// sign-up, since that's the only known cause once Google's own round
		// trip already succeeded.
		return NextResponse.redirect(`${origin}/not-invited`);
	}

	return NextResponse.redirect(`${origin}/login`);
}
