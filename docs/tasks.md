# Metro:Otherscape Character Sheet — Task list

Status: draft v1
Owner: Gavin Li
Related: [PRD.md](./PRD.md) (what and why), [system-design.md](./system-design.md)
(technical decisions), [design.md](./design.md) (interface)

---

## S12 Discord per campaign

### T68 Migration: discord_webhook_url on campaigns
Add a `discord_webhook_url` column to `campaigns` (nullable text). Existing
tables keep rolling through the single `DISCORD_WEBHOOK_URL` env var until
this ships.
**Refs:** `app/character/[id]/_lib/roll-action.ts`

### T69 Read the webhook from the campaign, fall back to the env var
In `roll-action.ts`, look up the character's campaign and use its
`discord_webhook_url` when set. Fall back to `process.env.DISCORD_WEBHOOK_URL`
for characters with no campaign or no campaign-level URL, so nothing breaks
during the transition.
**Depends on:** T68

### T70 Campaign settings UI to set the webhook URL
Let a campaign admin paste and save a Discord webhook URL for that campaign,
next to the existing `discord_enabled` toggle.
**Depends on:** T68

### T71 Retire the env var
Once every campaign has its own URL, drop the `DISCORD_WEBHOOK_URL` fallback
from `roll-action.ts` and the env config.
**Depends on:** T69, T70
