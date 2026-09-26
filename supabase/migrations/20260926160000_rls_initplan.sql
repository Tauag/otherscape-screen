-- RLS policies called auth.uid() and current_user_is_admin() bare, so
-- Postgres ran them once per row. Permissive policies are OR'ed, so even a
-- player's own-roster query ran the admin lookup on every candidate row.
-- Wrapped in (select ...), each runs once per query as an InitPlan.
-- Same rules, recreated in place.

alter policy own_characters on characters
  using (owner = (select auth.uid()))
  with check (owner = (select auth.uid()));

alter policy admin_read_characters on characters
  using ((select current_user_is_admin()));

alter policy admin_write_characters on characters
  using ((select current_user_is_admin()))
  with check ((select current_user_is_admin()));

alter policy admin_campaigns on campaigns
  using ((select current_user_is_admin()))
  with check ((select current_user_is_admin()));

alter policy admin_campaign_characters on campaign_characters
  using ((select current_user_is_admin()))
  with check ((select current_user_is_admin()));

-- The primary key leads with campaign_id, so a character delete's cascade
-- into this table could not use it and scanned the whole table.
create index on campaign_characters (character_id);
