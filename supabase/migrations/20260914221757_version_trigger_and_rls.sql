-- T05: version trigger, RLS, and column grants
-- sysdesign 3

create function bump_version() returns trigger
language plpgsql as $$
begin
  new.version    = old.version + 1;
  new.updated_at = now();
  return new;
end;
$$;

create trigger characters_bump_version
  before update on characters
  for each row execute function bump_version();

alter table characters enable row level security;

create policy own_characters on characters
  for all to authenticated
  using (owner = auth.uid())
  with check (owner = auth.uid());

revoke all on characters from authenticated;
grant select, delete on characters to authenticated;
grant insert (owner, data, share_token) on characters to authenticated;
grant update (data, share_token) on characters to authenticated;

alter table content_packs enable row level security;
create policy read_pack on content_packs
  for select to authenticated using (true);
