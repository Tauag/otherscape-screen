import { bindings, defineConfig, defineWorker } from "cf/config";

export default defineConfig({
	worker: defineWorker({
		name: "otherscape-screen",
		entrypoint: "./worker/index.ts",
		compatibilityDate: "2026-11-04",
		compatibilityFlags: ["nodejs_compat"],
		assets: {
			htmlHandling: "none",
			notFoundHandling: "none",
			runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
		},
		// Daily Supabase keepalive, see worker/index.ts.
		triggers: [{ type: "scheduled", schedule: "0 12 * * *" }],
		env: {
			ASSETS: bindings.assets(),
			IMAGES: bindings.images(),
		},
	}),
});
