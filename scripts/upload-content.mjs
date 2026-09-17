// Upserts a content/*.json file into the content_packs table (see
// supabase/migrations/20260914221756_characters_and_content_packs.sql).
// RLS only grants content_packs select to authenticated, so this needs the
// service role key, which bypasses RLS: run with
//   node --env-file=.env.local scripts/upload-content.mjs content/themebooks.json
import { readFileSync } from "node:fs";
import { basename, extname } from "node:path";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
	throw new Error(
		"Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (Project Settings > API in the Supabase dashboard)",
	);
}

const file = process.argv[2] ?? "content/themebooks.json";
const id = basename(file, extname(file));
const data = JSON.parse(readFileSync(file, "utf8"));

const supabase = createClient(url, serviceKey);
const { error } = await supabase.from("content_packs").upsert({ id, data });
if (error) throw error;

console.log(`Uploaded ${file} to content_packs.${id}`);
