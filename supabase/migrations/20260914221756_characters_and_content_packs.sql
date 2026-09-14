-- T04: characters and content_packs
-- sysdesign 3

create extension if not exists pgcrypto;

create table characters (
  id          uuid primary key default gen_random_uuid(),
  owner       uuid not null references auth.users on delete cascade,
  data        jsonb not null,
  version     int  not null default 1,
  share_token uuid unique,
  name        text generated always as (data->>'name') stored,
  essence     text generated always as (data->>'essence') stored,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index on characters (owner, updated_at desc);

create table content_packs (
  id         text primary key,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);
