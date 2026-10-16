-- Each campaign posts rolls to its own Discord channel via a webhook URL.
-- The URL is a secret: only admins can read the column (campaigns RLS), and
-- the server reads it for rolls with the service role, never a player's JWT.

alter table campaigns add column discord_webhook_url text;

grant update (discord_webhook_url) on campaigns to authenticated;

-- Saving the webhook must not bump the version the open editor's autosave
-- checks, so the trigger now fires only when the document changes.
drop trigger campaigns_bump_version on campaigns;
create trigger campaigns_bump_version
  before update of data on campaigns
  for each row execute function bump_version();

create or replace function character_discord_webhook(p_character_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select c.discord_webhook_url
  from public.campaign_characters cc
  join public.campaigns c on c.id = cc.campaign_id
  where cc.character_id = p_character_id
$$;

-- Callable only by the server's service-role client, which has already
-- checked through RLS that the caller may open the character.
revoke execute on function character_discord_webhook(uuid) from public, anon, authenticated;
grant execute on function character_discord_webhook(uuid) to service_role;
