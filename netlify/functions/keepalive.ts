// Netlify scheduled function: once a day, call /api/keepalive so the free
// Supabase project never pauses. Scheduled functions have no public URL, so
// the route does the work and this only triggers it. `URL` is the site's main
// address, one of the few build variables Netlify also sets at runtime.
export default async () => {
	const response = await fetch(`${process.env.URL}/api/keepalive`, {
		headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
	});
	// Throwing marks the run failed in the Netlify function log.
	if (!response.ok)
		throw new Error(`keepalive ${response.status}: ${await response.text()}`);
};

export const config = { schedule: "@daily" };
