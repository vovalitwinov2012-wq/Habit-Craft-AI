create extension if not exists "pgcrypto";

create table if not exists users (
  id text primary key,
  username text,
  first_name text,
  last_name text,
  metadata jsonb default '{}'::jsonb,
  is_premium boolean default false,
  role text default 'user',
  consent_analytics boolean default false,
  created_at timestamptz default now()
);

create table if not exists habits (
  id text primary key,
  owner text not null,
  title text not null,
  quote text,
  color text,
  completed_days integer default 0,
  total_days integer default 1,
  completed_dates jsonb default '[]'::jsonb,
  category text,
  goal integer,
  reminder text,
  visibility text default 'private',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists analytics_events (
  id text primary key default gen_random_uuid(),
  event_type text not null,
  owner text null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists analytics_counters (
  id text primary key default gen_random_uuid(),
  key text not null,
  value bigint default 0,
  updated_at timestamptz default now()
);
