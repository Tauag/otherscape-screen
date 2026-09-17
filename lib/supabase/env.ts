const required = (name: string, value: string | undefined): string => {
	if (!value) throw new Error(`Missing required env var: ${name}`);
	return value;
};

export const supabaseUrl = required(
	"NEXT_PUBLIC_SUPABASE_URL",
	process.env.NEXT_PUBLIC_SUPABASE_URL,
);
export const supabaseKey = required(
	"NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY",
	process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
