-- Lets an admin edit any character through the normal /character board
-- (autosave, share links), not just view it. Read-only access already
-- exists via admin_read_characters. Scoped to update: an admin still can't
-- insert (create characters owned by someone else) or delete another
-- player's character.
create policy admin_write_characters on characters
  for update to authenticated
  using (current_user_is_admin())
  with check (current_user_is_admin());
