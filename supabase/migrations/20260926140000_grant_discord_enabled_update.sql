-- T05's column grant only covered `data` and `share_token`, so every write
-- to discord_enabled from the app was rejected at the grant level before
-- protect_discord_enabled_trigger (or any RLS policy) was even checked.
grant update (discord_enabled) on characters to authenticated;
