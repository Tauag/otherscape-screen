-- Admin role access
--
-- Turns the `role` column that's been riding along on invited_emails since
-- T12 into something the app actually reads: an admin page that lists
-- invited users and can view (not edit) anyone's characters.

create function current_user_is_admin() returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from invited_emails
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
    and role = 'admin'
  );
$$;

revoke execute on function current_user_is_admin() from public;
grant execute on function current_user_is_admin() to authenticated;

-- invited_emails has no read policies (see T12), so only a security-definer
-- function can list it. Raises rather than filtering to empty, so a bug in
-- the caller's own admin gate fails loudly instead of rendering an empty list.
create function admin_list_users()
returns table (
  email           text,
  role            text,
  invited_at      timestamptz,
  user_id         uuid,
  last_sign_in_at timestamptz
)
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if not current_user_is_admin() then
    raise exception 'not authorized';
  end if;

  return query
  select ie.email, ie.role, ie.invited_at, au.id, au.last_sign_in_at
  from invited_emails ie
  left join auth.users au on lower(au.email) = ie.email
  order by ie.invited_at desc;
end;
$$;

revoke execute on function admin_list_users() from public;
grant execute on function admin_list_users() to authenticated;

-- Additive to own_characters: read-only, so an admin can view any character
-- but still can't write through the plain update/delete grants.
create policy admin_read_characters on characters
  for select to authenticated
  using (current_user_is_admin());
