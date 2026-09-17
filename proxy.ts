import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
	decideRoute,
	isAuthCallbackPath,
} from "@/lib/supabase/route-decision.mjs";
import { supabaseUrl, supabaseKey } from "@/lib/supabase/env";

// Next.js 16 renamed the middleware.ts convention to proxy.ts; behavior is
// unchanged. See node_modules/next/dist/docs/.../proxy.md.

export async function proxy(request: NextRequest) {
	const pathname = request.nextUrl.pathname;
	const cookiesToSet: {
		name: string;
		value: string;
		options: CookieOptions;
	}[] = [];

	const supabase = createServerClient(supabaseUrl, supabaseKey, {
		cookies: {
			getAll: () => request.cookies.getAll(),
			setAll: (cookies) => {
				cookies.forEach(({ name, value }) => request.cookies.set(name, value));
				cookiesToSet.push(...cookies);
			},
		},
	});

	// getClaims verifies the JWT (locally against the project's JWKS, or via
	// the auth server as a fallback) rather than trusting the cookie as-is.
	const { data } = await supabase.auth.getClaims();
	const email = data?.claims.email as string | undefined;
	const invited =
		email && !isAuthCallbackPath(pathname)
			? (await supabase.rpc("current_user_invited")).data === true
			: undefined;
	const route = decideRoute({ pathname, email, invited });

	if (route === "not-invited") {
		await supabase.auth.signOut();
	}

	const redirectPath: Record<Exclude<typeof route, "next">, string> = {
		login: "/login",
		home: "/",
		"not-invited": "/not-invited",
	};
	const response =
		route === "next"
			? NextResponse.next({ request })
			: NextResponse.redirect(new URL(redirectPath[route], request.url));

	cookiesToSet.forEach(({ name, value, options }) =>
		response.cookies.set(name, value, options),
	);
	return response;
}

export const config = {
	matcher: [
		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)",
	],
};
