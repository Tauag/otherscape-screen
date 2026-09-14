// Shared by client.ts, server.ts, and proxy.ts, so the two-name key fallback
// (PUBLISHABLE_KEY, the new name; ANON_KEY, the old one) lives in one place.
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
