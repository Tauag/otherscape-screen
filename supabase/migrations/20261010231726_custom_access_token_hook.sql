-- Adds an `invited` boolean claim to every access token so proxy.ts can skip
-- the current_user_invited() RPC on each request. Enable in Dashboard:
-- Authentication > Hooks > Customize Access Token.
-- A revoked invite now takes effect at the next token refresh, not at once.
-- security definer: reads invited_emails (RLS on, no policies) without a
-- grant to supabase_auth_admin.
create function public.custom_access_token_hook(event jsonb) returns jsonb
language plpgsql security definer set search_path = public stable as $$
declare
  claims jsonb := event->'claims';
begin
  claims := jsonb_set(
    claims,
    '{invited}',
    to_jsonb(exists (
      select 1 from invited_emails
      where email = lower(coalesce(claims->>'email', ''))
    ))
  );
  return jsonb_set(event, '{claims}', claims);
end;
$$;

grant usage on schema public to supabase_auth_admin;
revoke all on function public.custom_access_token_hook(jsonb) from public, anon, authenticated;
grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;
