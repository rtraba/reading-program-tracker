create extension if not exists pgcrypto;

create table if not exists programs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists phases (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references programs(id) on delete cascade,
  position integer not null,
  name text not null,
  objective text,
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists books (
  id uuid primary key default gen_random_uuid(),
  phase_id uuid not null references phases(id) on delete cascade,
  position integer not null,
  title text not null,
  author text not null,
  style text,
  intensity integer,
  difficulty integer,
  start_date date not null,
  end_date date not null,
  status text not null default 'planned' check (status in ('planned', 'in_progress', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references books(id) on delete cascade,
  session_date date not null,
  minutes integer not null default 0,
  pages integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists evaluations (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('program', 'phase', 'book')),
  target_id uuid not null,
  evaluation_date date not null,
  comprehension integer not null check (comprehension between 1 and 5),
  retention integer not null check (retention between 1 and 5),
  application integer not null check (application between 1 and 5),
  satisfaction integer not null check (satisfaction between 1 and 5),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists reflections (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('program', 'phase', 'book')),
  target_id uuid not null,
  reflection_date date not null,
  content text not null,
  tags text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_phases_program_position on phases(program_id, position);
create index if not exists idx_books_phase_position on books(phase_id, position);
create index if not exists idx_books_end_date on books(end_date);
create index if not exists idx_sessions_book_date on sessions(book_id, session_date desc);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_programs_updated_at on programs;
create trigger trg_programs_updated_at before update on programs
for each row execute function set_updated_at();

drop trigger if exists trg_phases_updated_at on phases;
create trigger trg_phases_updated_at before update on phases
for each row execute function set_updated_at();

drop trigger if exists trg_books_updated_at on books;
create trigger trg_books_updated_at before update on books
for each row execute function set_updated_at();

drop trigger if exists trg_sessions_updated_at on sessions;
create trigger trg_sessions_updated_at before update on sessions
for each row execute function set_updated_at();

drop trigger if exists trg_evaluations_updated_at on evaluations;
create trigger trg_evaluations_updated_at before update on evaluations
for each row execute function set_updated_at();

drop trigger if exists trg_reflections_updated_at on reflections;
create trigger trg_reflections_updated_at before update on reflections
for each row execute function set_updated_at();
