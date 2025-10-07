-- 001_create_tables.sql
create extension if not exists "pgcrypto";

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
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists progress (
  id text primary key,
  user_id text not null,
  habit_id text not null references habits(id) on delete cascade,
  date date not null,
  data jsonb default '{}'::jsonb,
  streak integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint unique_user_habit_date unique (user_id, habit_id, date)
);

create table if not exists users (
  id text primary key,
  username text,
  first_name text,
  last_name text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
