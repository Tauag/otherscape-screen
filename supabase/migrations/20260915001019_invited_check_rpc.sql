-- T12b: let a signed-in user check their own invite status
-- sysdesign 5
--
-- The auth.users insert trigger (20260914235646) only ever stops a *new*
-- account. It can't touch one that already existed before that migration,
-- or one whose invite is later revoked by deleting its invited_emails row.
-- proxy.ts calls this on every request to close that gap: sign the session
-- out the moment its email is no longer on the list.

create function current_user_invited() returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from invited_emails
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke execute on function current_user_invited() from public;
grant execute on function current_user_invited() to authenticated;
