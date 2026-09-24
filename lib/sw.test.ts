import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

// public/sw.js is a classic worker script, so it runs here against a stub
// `self` rather than being imported.
function load(fetchImpl: (request: Request) => Promise<Response>) {
	const handlers: Record<string, (event: unknown) => void> = {};
	const stored = new Map<string, Response>();
	const cache = {
		put: async (request: Request, response: Response) => {
			stored.set(request.url, response);
		},
	};
	const context = {
		self: {
			location: new URL("https://app.test/"),
			addEventListener: (type: string, fn: (event: unknown) => void) => {
				handlers[type] = fn;
			},
		},
		caches: {
			open: async () => cache,
			match: async (request: Request) => stored.get(request.url),
		},
		fetch: fetchImpl,
		Response,
		URL,
	};
	runInNewContext(
		readFileSync(new URL("../public/sw.js", import.meta.url), "utf8"),
		context,
	);
	const strategy = (context as unknown as Record<string, unknown>).strategy as (
		method: string,
		url: URL,
	) => string | null;

	/** Resolves to the response the worker answered with, or null if it let the request through. */
	async function request(url: string, method = "GET") {
		// Cast, or TS narrows to null and misses the assignment in respondWith.
		let answer = null as Promise<Response> | null;
		const pending: Promise<unknown>[] = [];
		handlers.fetch({
			request: new Request(url, { method }),
			respondWith: (response: Promise<Response>) => {
				answer = response;
			},
			waitUntil: (work: Promise<unknown>) => pending.push(work),
		});
		const response = answer === null ? null : await answer;
		await Promise.all(pending);
		return response;
	}

	return { strategy, request, stored };
}

test("only same-origin GETs outside /api and /auth are handled", () => {
	const { strategy } = load(() => Promise.reject(new Error("offline")));
	const at = (path: string) => new URL(path, "https://app.test/");

	assert.equal(strategy("GET", at("/_next/static/chunks/a.js")), "static");
	assert.equal(strategy("GET", at("/character/1")), "page");
	assert.equal(strategy("GET", at("/character/1?_rsc=abc")), "page");
	assert.equal(strategy("POST", at("/character/1")), null);
	assert.equal(strategy("GET", at("/api/keepalive")), null);
	assert.equal(strategy("GET", at("/auth/callback")), null);
	assert.equal(strategy("GET", new URL("https://x.supabase.co/rest/v1")), null);
});

test("a page is fetched fresh and stored, then served from the cache offline", async () => {
	let online = true;
	const { request } = load(async () => {
		if (!online) throw new TypeError("Failed to fetch");
		return new Response("fresh", { status: 200 });
	});

	assert.equal(await (await request("https://app.test/"))?.text(), "fresh");
	online = false;
	assert.equal(await (await request("https://app.test/"))?.text(), "fresh");
	assert.equal((await request("https://app.test/never-seen"))?.type, "error");
});

test("a redirect is passed on but never replaces the stored page", async () => {
	const { request, stored } = load(
		async () => new Response(null, { status: 307 }),
	);
	assert.equal((await request("https://app.test/"))?.status, 307);
	assert.equal(stored.size, 0);
});
