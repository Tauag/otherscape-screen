// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { unstable_isUnrecognizedActionError } from "next/navigation";

// A tab left open across a deploy calls server action IDs the new build no
// longer has. Next only hard-reloads on navigation skew, not on action calls.
// Actions that a caller catches, or that reach global-error.tsx, are handled there.
// lazy: the failed action is dropped and the user redoes it after the reload.
// Upgrade path: stash the pending action in sessionStorage and replay it on load.
window.addEventListener("unhandledrejection", (event) => {
	if (unstable_isUnrecognizedActionError(event.reason))
		window.location.reload();
});

Sentry.init({
	dsn: "https://4a1c1982c7b42917c361d6bf8b1ff8e8@o4512166196609025.ingest.us.sentry.io/4512166385876992",
	enabled: process.env.NODE_ENV === "production",

	// Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
	tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1,

	// Turns off collection of data that could identify users. Adjust per category:
	// https://docs.sentry.io/platforms/javascript/configuration/options/#dataCollection
	dataCollection: {
		userInfo: false,
		graphQL: { document: false, variables: false },
		genAI: { inputs: false, outputs: false },
		databaseQueryData: false,
		queues: false,
		httpBodies: [],
		httpHeaders: { deny: ["forwarded", "-ip", "remote-", "via", "-user"] },
		cookies: { deny: ["forwarded", "-ip", "remote-", "via", "-user"] },
		urlQueryParams: { deny: ["forwarded", "-ip", "remote-", "via", "-user"] },
	},
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
