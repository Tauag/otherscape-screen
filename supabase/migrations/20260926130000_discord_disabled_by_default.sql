-- New characters should not post to Discord until an admin turns it on.
-- Existing characters keep whatever value they already have.
alter table characters
  alter column discord_enabled set default false;
