-- BAUM GRE v2.7 server-side question-bank schema
create table if not exists gre_questions (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in ('Quant','Verbal')),
  skill text not null,
  difficulty text not null check (difficulty in ('Easy','Medium','Hard','Very Hard')),
  prompt text not null,
  choices jsonb,
  correct_answer jsonb not null,
  explanation text,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists gre_test_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  question_ids uuid[] not null,
  created_at timestamptz default now(),
  expires_at timestamptz not null,
  submitted_at timestamptz
);

alter table gre_questions enable row level security;
alter table gre_test_sessions enable row level security;

-- Do not grant browser clients SELECT access to correct_answer/explanation.
-- Recommended: expose questions through an authenticated Edge Function/API
-- that strips correct_answer and explanation before returning payloads.
