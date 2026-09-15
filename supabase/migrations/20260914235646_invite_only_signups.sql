-- T12: invite-only signups
-- sysdesign 3
--
-- Blocks account creation (any provider, including the Google OAuth first
-- sign-in) for an email that isn't on the allow-list. This runs in the
-- database, so it holds regardless of which client or provider triggers the
-- sign-up.
--
-- To invite someone, insert their email here directly (Studio's table
-- editor, or the SQL editor). That's a data change, not a schema migration,
-- so it doesn't need `supabase db push` and won't show up as drift.
--
-- `role` rides along for a later change (admins editing any character, not
-- just their own). Nothing reads it yet; it's here now only because it
-- belongs on this same row, invited as an admin from the start rather than
-- promoted after the fact.

create table invited_emails (
  email      text primary key check (email = lower(email)),
  role       text not null default 'user' check (role in ('user', 'admin')),
  invited_at timestamptz not null default now()
);

alter table invited_emails enable row level security;
-- No policies: nobody but the table owner (used below via security definer) can read or write this.

create function enforce_invite_only() returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from invited_emails where email = lower(new.email)) then
    raise exception 'not invited: %', new.email;
  end if;
  return new;
end;
$$;

create trigger auth_users_invite_only
  before insert on auth.users
  for each row execute function enforce_invite_only();
