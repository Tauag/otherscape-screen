-- Adds display_name to admin_list_users, pulled from the same OAuth
-- metadata the roster header already reads (app/page.tsx: full_name, then
-- name). Changing a table function's return type needs drop + recreate;
-- CREATE OR REPLACE can't add a column.

drop function admin_list_users();

create function admin_list_users()
returns table (
  email           text,
  role            text,
  invited_at      timestamptz,
  user_id         uuid,
  display_name    text,
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
  select
    ie.email,
    ie.role,
    ie.invited_at,
    au.id,
    coalesce(
      au.raw_user_meta_data ->> 'full_name',
      au.raw_user_meta_data ->> 'name'
    ),
    au.last_sign_in_at
  from invited_emails ie
  left join auth.users au on lower(au.email) = ie.email
  order by ie.invited_at desc;
end;
$$;

revoke execute on function admin_list_users() from public;
grant execute on function admin_list_users() to authenticated;
