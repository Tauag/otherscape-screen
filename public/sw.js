// Offline copy of the app: every page and build file this browser has fetched.
// Supabase is cross-origin and passes through; the pack and character caches
// in localStorage cover it.

// Bump when the rules below change. Activation drops every other cache.
const CACHE = "otherscape-v1";

/**
 * "static" is cache-first (build files are content-hashed, so never stale).
 * "page" is network-first with the cache as fallback: navigations and RSC
 * `?_rsc=` fetches. null leaves the request to the browser.
 */
function strategy(method, url) {
	if (method !== "GET" || url.origin !== self.location.origin) return null;
	if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/"))
		return null;
	return url.pathname.startsWith("/_next/static/") ? "static" : "page";
}

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(
					keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
				),
			)
			.then(() => self.clients.claim()),
	);
});

self.addEventListener("fetch", (event) => {
	const { request } = event;
	const kind = strategy(request.method, new URL(request.url));
	if (kind === "static")
		event.respondWith(
			caches.match(request).then((hit) => hit ?? fetchAndStore(event)),
		);
	if (kind === "page")
		event.respondWith(
			fetchAndStore(event).catch(() =>
				caches.match(request).then((hit) => hit ?? Response.error()),
			),
		);
});

// lazy: nothing is ever evicted, so every deploy's build files and every page
// visited pile up until the version bumps. Ceiling: the origin's storage quota.
// Upgrade path: on activate, drop /_next/static/ entries the current pages no
// longer reference, or cap the entry count.
async function fetchAndStore(event) {
	const response = await fetch(event.request);
	// 200 only: a redirect (the login bounce) or an error must not replace a good copy.
	if (response.status === 200) {
		const copy = response.clone();
		event.waitUntil(
			caches.open(CACHE).then((cache) => cache.put(event.request, copy)),
		);
	}
	return response;
}

// The page that registered this worker loaded before the worker could see it.
// It posts its own URL and build files so the first visit works offline too.
self.addEventListener("message", (event) => {
	if (!Array.isArray(event.data)) return;
	event.waitUntil(
		caches.open(CACHE).then((cache) =>
			Promise.all(
				event.data
					.filter((url) => strategy("GET", new URL(url, self.location.href)))
					.map((url) =>
						fetch(url)
							.then(
								(response) =>
									response.status === 200 && cache.put(url, response),
							)
							.catch(() => {}),
					),
			),
		),
	);
});
