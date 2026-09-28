# Otherscape Screen

A mobile-first character sheet for Metro: Otherscape (the City of Mist
engine). See `docs/PRD.md` for the product scope and `docs/system-design.md`
for the technical decisions.

## Stack

- Next.js 16 (App Router), React 19
- Supabase (Postgres, Auth, RLS) for storage
- Base UI for interactive components
- Netlify for hosting

## Prerequisites

- Node 26 (see `.nvmrc`; run `nvm use`)
- [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started)
- Docker, to run Supabase locally

## Setup

### 1. Install dependencies

```bash
npm install
```

This also configures git hooks (`.githooks`) via the `prepare` script.

### 2. Start Supabase locally

```bash
supabase start
```

This applies every file in `supabase/migrations/` to a fresh local database
and prints your local API URL and keys.

### 3. Configure environment variables

Create `.env.local` in the project root:

```bash
# From `supabase start` output (local) or Project Settings > API (hosted project)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: enables the Discord webhook write path
DISCORD_WEBHOOK_URL=

```

`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is read as
`NEXT_PUBLIC_SUPABASE_ANON_KEY` on older Supabase CLI output; either name
works.

### 4. Invite your account

Signups are invite-only (`supabase/migrations/20260914235646_invite_only_signups.sql`).
Before you sign in for the first time, add your email to the allow-list on
the local database:

```bash
supabase db execute --local --sql \
  "insert into invited_emails (email, role) values ('you@example.com', 'admin');"
```

Use your Supabase Studio SQL editor instead for a hosted project.

### 5. Wire up OAuth providers

Sign-in uses Google and Discord (`lib/actions.ts`); both need an OAuth app
and a set of credentials.

1. **Google** — Add an authorized redirect URI of `<your Supabase API URL>/auth/v1/callback`
(locally: `http://127.0.0.1:54321/auth/v1/callback`) via the the Google Cloud Console.
2. **Discord** — [Discord Developer Portal](https://discord.com/developers/applications) >
   New Application > OAuth2. Add the same redirect URI under Redirects.
3. Export both client IDs and secrets before starting Supabase, so the CLI
   can substitute them into `supabase/config.toml`:

   ```bash
   export SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=...
   export SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=...
   export SUPABASE_AUTH_EXTERNAL_DISCORD_CLIENT_ID=...
   export SUPABASE_AUTH_EXTERNAL_DISCORD_SECRET=...
   supabase start  # or `supabase stop && supabase start` if it's already running
   ```

For a hosted project, skip `config.toml` and enter the same client ID and
secret under Authentication > Providers in the Supabase dashboard instead;
use `https://<project-ref>.supabase.co/auth/v1/callback` as the redirect URI.

### 6. Load a content pack

The character sheet reads themebook text (questions, specials, the
reference cheatsheet) from the `content_packs` table rather than from code,
since that text is licensed rulebook content and isn't checked into this
repo (see `/content` in `.gitignore`).

Copy `content/content_pack.sample.json` to `content/content_pack.json` and fill in
your own rulebook text, then upload it:

```bash
cp content/content_pack.sample.json content/content_pack.json
npm run upload-content
```

Until a pack is uploaded, the app runs against `lib/content/fallback.ts`:
every screen renders with the correct structure and blank text.

### 7. Run the app

```bash
npm run dev
```

Open http://localhost:3000.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` / `npm run start` — production build and serve
- `npm test` — run the test suite
- `npm run lint` / `npm run format` — Biome lint and format
- `npm run upload-content -- <file>` — upsert a content pack JSON file into
  `content_packs` (defaults to `content/themebooks.json`)

## Database changes

New SQL goes in `supabase/migrations/`, created with
`supabase migration new <name>`. Migrations are written here but applied by
hand with `supabase db push` after review; see `CLAUDE.md` for the full
migration workflow.
