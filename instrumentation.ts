import { EventEmitter } from "node:events";
import * as Sentry from "@sentry/nextjs";

export async function register() {
	if (process.env.NEXT_RUNTIME === "nodejs") {
		await import("./sentry.server.config");
	}

	if (process.env.NEXT_RUNTIME === "edge") {
		await import("./sentry.edge.config");
	}

	if (process.env.NEXT_RUNTIME === "nodejs") {
		EventEmitter.defaultMaxListeners = 15;
	}
}

export const onRequestError = Sentry.captureRequestError;
