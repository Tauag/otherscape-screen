-- T62: campaigns and campaign_characters
-- sysdesign 3. Admin-only: the GM is any admin (sysdesign 5), so both tables
-- reuse current_user_is_admin() and a non-admin sees and writes nothing.

create table campaigns (
  id         uuid primary key default gen_random_uuid(),
  owner      uuid not null references auth.users on delete cascade,
  data       jsonb not null,
  version    int  not null default 1,
  name       text generated always as (data->>'name') stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger campaigns_bump_version
  before update on campaigns
  for each row execute function bump_version();

create table campaign_characters (
  campaign_id  uuid not null references campaigns on delete cascade,
  character_id uuid not null references characters on delete cascade,
  added_at     timestamptz not null default now(),
  primary key (campaign_id, character_id)
);

alter table campaigns enable row level security;

create policy admin_campaigns on campaigns
  for all to authenticated
  using (current_user_is_admin())
  with check (current_user_is_admin());

revoke all on campaigns from authenticated;
grant select, delete on campaigns to authenticated;
grant insert (owner, data) on campaigns to authenticated;
grant update (data) on campaigns to authenticated;

alter table campaign_characters enable row level security;

create policy admin_campaign_characters on campaign_characters
  for all to authenticated
  using (current_user_is_admin())
  with check (current_user_is_admin());

-- A link row is added or removed, never edited.
revoke all on campaign_characters from authenticated;
grant select, delete on campaign_characters to authenticated;
grant insert (campaign_id, character_id) on campaign_characters to authenticated;
