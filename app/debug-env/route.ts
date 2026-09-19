import { NextResponse } from "next/server";

// Temporary diagnostic route for the Netlify origin-redirect bug. Delete once
// the real host source is confirmed.
export async function GET(request: Request) {
	return NextResponse.json({
		requestUrlOrigin: new URL(request.url).origin,
		headerHost: request.headers.get("host"),
		headerXForwardedHost: request.headers.get("x-forwarded-host"),
		headerOrigin: request.headers.get("origin"),
		envURL: process.env.URL ?? null,
		envDEPLOY_URL: process.env.DEPLOY_URL ?? null,
		envDEPLOY_PRIME_URL: process.env.DEPLOY_PRIME_URL ?? null,
		envCONTEXT: process.env.CONTEXT ?? null,
	});
}
