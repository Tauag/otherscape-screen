-- Lets an admin control which characters may post rolls to the table's
-- Discord channel, independent of who owns the character. Defaults to
-- enabled so existing characters keep behaving as they do today.

alter table characters
  add column discord_enabled boolean not null default true;

-- own_characters lets a player update any column on their own row, and
-- admin_write_characters lets an admin update any row. Without this trigger
-- either write path could flip this flag; only an admin should be able to.
create function protect_discord_enabled() returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.discord_enabled is distinct from old.discord_enabled
     and not current_user_is_admin() then
    new.discord_enabled := old.discord_enabled;
  end if;
  return new;
end;
$$;

create trigger protect_discord_enabled_trigger
before update on characters
for each row
execute function protect_discord_enabled();
