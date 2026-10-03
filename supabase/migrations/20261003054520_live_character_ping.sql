-- Live sheets: ping open viewers when a character's data changes, so the GM,
-- share-link readers, and the player's other devices refetch. The ping holds
-- only the version, never the document: the channels are public, and the
-- refetch still goes through RLS or shared_character().
--
-- lazy: public channels, so anyone who knows an id or share token can also
-- send fake pings. Ceiling: a fake ping only causes a refetch, never a wrong
-- sheet, but a flood of them is a flood of refetches. Upgrade path: private
-- channels with select/insert policies on realtime.messages.
--
-- realtime.send catches its own errors and raises a warning, so a Realtime
-- outage never fails a save.

create function notify_character_changed() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  ping jsonb := jsonb_build_object('version', new.version);
begin
  perform realtime.send(ping, 'changed', 'character:' || new.id, false);
  -- Share readers know only the token, not the id.
  if new.share_token is not null then
    perform realtime.send(ping, 'changed', 'share:' || new.share_token, false);
  end if;
  return null;
end;
$$;

create trigger characters_notify_changed
  after update of data on characters
  for each row execute function notify_character_changed();
