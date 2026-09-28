import { withSentryConfig } from "@sentry/nextjs/config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// A cached worker script would pin every browser to an old one.
	headers: async () => [
		{
			source: "/sw.js",
			headers: [
				{
					key: "Content-Type",
					value: "application/javascript; charset=utf-8",
				},
				{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
				{
					key: "Content-Security-Policy",
					value: "default-src 'self'; script-src 'self'",
				},
			],
		},
	],
};

export default withSentryConfig(nextConfig, {
	// For all available options, see:
	// https://www.npmjs.com/package/@sentry/webpack-plugin#options

	org: "gavin-li",

	project: "otherscape-screen",

	// Only print logs for uploading source maps in CI
	silent: !process.env.CI,

	// For all available options, see:
	// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

	// Upload a larger set of source maps for prettier stack traces (increases build time)
	widenClientFileUpload: true,

	// Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
	// This can increase your server load as well as your hosting bill.
	// Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
	// side errors will fail.
	tunnelRoute: "/monitoring",

	webpack: {
		// Tree-shaking options for reducing bundle size
		treeshake: {
			// Automatically tree-shake Sentry logger statements to reduce bundle size
			removeDebugLogging: true,
		},
	},
});
