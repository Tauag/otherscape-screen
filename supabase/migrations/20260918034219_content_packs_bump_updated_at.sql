-- content_packs.updated_at never changed on re-upload (no trigger set it, and
-- the column default only applies on insert), so a browser that had already
-- cached a pack under the old timestamp kept serving it forever: load.ts
-- treats a matching timestamp as "nothing changed" and skips the refetch.

create function bump_content_pack_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger content_packs_bump_updated_at
  before update on content_packs
  for each row execute function bump_content_pack_updated_at();
