-- A character belongs to at most one campaign.

-- Keep the earliest assignment of any character that is in several campaigns.
delete from campaign_characters a
using campaign_characters b
where a.character_id = b.character_id
  and (a.added_at, a.campaign_id) > (b.added_at, b.campaign_id);

-- The unique constraint's index replaces the plain one from rls_initplan.
drop index if exists campaign_characters_character_id_idx;
alter table campaign_characters
  add constraint campaign_characters_character_id_key unique (character_id);
