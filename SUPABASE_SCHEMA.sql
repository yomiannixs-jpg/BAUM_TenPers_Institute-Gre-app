-- BAUM TenPers GRE v2.6 production cloud schema (Supabase/Postgres-ready)
create table if not exists student_profiles (
  user_id uuid primary key,
  email text unique not null,
  full_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create table if not exists student_progress (
  user_id uuid primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);
-- Enable RLS in production and restrict each row to auth.uid() = user_id.
alter table student_profiles enable row level security;
alter table student_progress enable row level security;
