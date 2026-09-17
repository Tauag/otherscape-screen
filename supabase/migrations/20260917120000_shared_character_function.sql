-- T44: shared_character function
-- sysdesign 4

create function shared_character(token uuid) returns jsonb
language sql security definer set search_path = public stable as $$
  select data from characters where share_token = token;
$$;

revoke execute on function shared_character(uuid) from public;
grant execute on function shared_character(uuid) to anon, authenticated;
