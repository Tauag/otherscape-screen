-- Invite by Discord ID, alongside invited_emails.
--
-- A Discord-ID invite matches only a Discord sign-in. After sign-up the ID is
-- read from auth.identities (written by Supabase Auth after OAuth), never from
-- user_metadata, which the user can edit.

create table invited_discord_ids (
  discord_id text primary key check (discord_id ~ '^[0-9]{17,20}$'),
  role       text not null default 'user' check (role in ('user', 'admin')),
  invited_at timestamptz not null default now()
);

alter table invited_discord_ids enable row level security;
-- No policies, same as invited_emails: only security-definer code reads it.

create function user_discord_id(p_user uuid) returns text
language sql
security definer
set search_path = ''
stable
as $$
  select provider_id from auth.identities
  where user_id = p_user and provider = 'discord'
  limit 1;
$$;

revoke execute on function user_discord_id(uuid) from public, anon, authenticated;

-- 'admin', 'user', or null (not invited). Admin wins if both rows match.
create function invite_role(p_email text, p_user uuid) returns text
language sql
security definer
set search_path = public
stable
as $$
  select case
    when count(*) = 0 then null
    when bool_or(role = 'admin') then 'admin'
    else 'user'
  end
  from (
    select role from invited_emails where email = lower(coalesce(p_email, ''))
    union all
    select role from invited_discord_ids where discord_id = user_discord_id(p_user)
  ) matches;
$$;

revoke execute on function invite_role(text, uuid) from public, anon, authenticated;

create or replace function current_user_invited() returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select invite_role(auth.jwt() ->> 'email', auth.uid()) is not null;
$$;

create or replace function current_user_is_admin() returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(invite_role(auth.jwt() ->> 'email', auth.uid()) = 'admin', false);
$$;

create or replace function public.custom_access_token_hook(event jsonb) returns jsonb
language plpgsql security definer set search_path = public stable as $$
declare
  claims jsonb := event->'claims';
begin
  claims := jsonb_set(
    claims,
    '{invited}',
    to_jsonb(invite_role(claims->>'email', (event->>'user_id')::uuid) is not null)
  );
  return jsonb_set(event, '{claims}', claims);
end;
$$;

-- At insert there is no auth.identities row yet, so match the provider's ID in
-- raw_user_meta_data. Requiring app_metadata.provider = 'discord' (set by
-- Supabase Auth, not the client) stops an email sign-up from faking the ID.
-- current_user_invited() re-checks against auth.identities on every session.
create or replace function enforce_invite_only() returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (select 1 from invited_emails where email = lower(new.email)) then
    return new;
  end if;
  if new.raw_app_meta_data ->> 'provider' = 'discord'
    and exists (
      select 1 from invited_discord_ids
      where discord_id = new.raw_user_meta_data ->> 'provider_id'
    ) then
    return new;
  end if;
  raise exception 'not invited: %', coalesce(new.email, 'no email');
end;
$$;

-- Return type changes (email is nullable, discord_id is new): drop + recreate.
drop function admin_list_users();

create function admin_list_users()
returns table (
  email           text,
  discord_id      text,
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
  select ie.email, null::text, ie.role, ie.invited_at, au.id,
    coalesce(au.raw_user_meta_data ->> 'full_name', au.raw_user_meta_data ->> 'name'),
    au.last_sign_in_at
  from invited_emails ie
  left join auth.users au on lower(au.email) = ie.email
  union all
  select null::text, di.discord_id, di.role, di.invited_at, au.id,
    coalesce(au.raw_user_meta_data ->> 'full_name', au.raw_user_meta_data ->> 'name'),
    au.last_sign_in_at
  from invited_discord_ids di
  left join auth.identities ai
    on ai.provider = 'discord' and ai.provider_id = di.discord_id
  left join auth.users au on au.id = ai.user_id
  order by 4 desc;
end;
$$;

revoke execute on function admin_list_users() from public;
grant execute on function admin_list_users() to authenticated;
