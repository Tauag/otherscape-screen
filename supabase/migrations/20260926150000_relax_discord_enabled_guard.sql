-- protect_discord_enabled fired on every write regardless of who made it,
-- reverting anything that wasn't an authenticated admin's own PostgREST
-- request. That silently undid migrations and Table Editor/SQL editor edits
-- too, since those run with no JWT context and current_user_is_admin() read
-- as false. Scope the guard to real end-user requests: direct SQL, the
-- service role, and migrations already bypass RLS and column grants, so
-- they're trusted here too.
create or replace function protect_discord_enabled() returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.discord_enabled is distinct from old.discord_enabled
     and auth.role() = 'authenticated'
     and not current_user_is_admin() then
    new.discord_enabled := old.discord_enabled;
  end if;
  return new;
end;
$$;
