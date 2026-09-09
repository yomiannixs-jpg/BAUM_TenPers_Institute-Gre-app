
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'student' check (role in ('student','instructor','admin')),
  institution_id uuid,
  target_score integer default 330,
  test_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.gre_questions (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in ('Quant','Verbal')),
  skill text not null,
  difficulty text not null,
  prompt text not null,
  choices jsonb not null,
  correct_answer text not null,
  explanation text,
  active boolean not null default true,
  created_at timestamptz default now()
);

create table if not exists public.test_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  test_type text not null,
  mode text not null,
  status text not null default 'active',
  started_at timestamptz default now(),
  completed_at timestamptz,
  quant_score integer,
  verbal_score integer,
  total_score integer,
  duration_seconds integer
);

create table if not exists public.session_questions (
  session_id uuid references public.test_sessions(id) on delete cascade,
  question_id uuid references public.gre_questions(id) on delete restrict,
  position integer not null,
  primary key(session_id,question_id)
);

create table if not exists public.question_responses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.test_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.gre_questions(id),
  selected_answer text,
  is_correct boolean,
  response_time_seconds integer,
  created_at timestamptz default now(),
  unique(session_id,question_id)
);

create table if not exists public.student_skill_stats (
  user_id uuid references auth.users(id) on delete cascade,
  skill text not null,
  attempted integer not null default 0,
  correct integer not null default 0,
  avg_time numeric,
  updated_at timestamptz default now(),
  primary key(user_id,skill)
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references auth.users(id),
  title text not null,
  test_type text not null,
  question_count integer not null,
  due_at timestamptz,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.test_sessions enable row level security;
alter table public.session_questions enable row level security;
alter table public.question_responses enable row level security;
alter table public.student_skill_stats enable row level security;
alter table public.assignments enable row level security;
alter table public.gre_questions enable row level security;

create policy "profile own read" on public.profiles for select using (auth.uid() = id);
create policy "profile own update" on public.profiles for update using (auth.uid() = id);
create policy "session own read" on public.test_sessions for select using (auth.uid() = user_id);
create policy "session own insert" on public.test_sessions for insert with check (auth.uid() = user_id);
create policy "response own read" on public.question_responses for select using (auth.uid() = user_id);
create policy "skill own read" on public.student_skill_stats for select using (auth.uid() = user_id);

-- Intentionally no direct student SELECT policy on gre_questions.
-- Questions and grading should be delivered through authenticated Edge Functions.
