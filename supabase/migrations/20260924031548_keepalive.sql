-- T51: the keepalive cron's query
-- sysdesign 11
--
-- A free Supabase project pauses after seven days without activity, and a
-- fortnightly campaign hits that. /api/keepalive calls this once a day. It
-- runs as anon because the cron has no session.

create function public.keepalive() returns int
language sql
as $$ select 1 $$;

revoke execute on function public.keepalive() from public;
grant execute on function public.keepalive() to anon;
