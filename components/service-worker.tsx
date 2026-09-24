"use client";

import { useEffect } from "react";

/** Registers public/sw.js. Production only: in dev its cache would serve stale builds. */
export function ServiceWorker() {
	useEffect(() => {
		if (process.env.NODE_ENV !== "production") return;
		if (!("serviceWorker" in navigator)) return;
		const { serviceWorker } = navigator;
		// Already controlled: the worker saw this page load and cached it itself.
		const warm = !serviceWorker.controller;

		serviceWorker.register("/sw.js", { updateViaCache: "none" });
		if (!warm) return;
		serviceWorker.ready.then(({ active }) => {
			const files = performance
				.getEntriesByType("resource")
				.map((entry) => entry.name)
				.filter((url) => url.startsWith(`${location.origin}/_next/static/`));
			active?.postMessage([location.href, ...files]);
		});
	}, []);

	return null;
}
