-- ================================================================
--  PAINBASE — Supabase schema
--  Colle ce fichier dans l'éditeur SQL de ton projet Supabase
--  (SQL Editor → New query → Run)
-- ================================================================

-- Extensions
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm"; -- recherche full-text rapide

-- ────────────────────────────────────────────────────────────────
--  PROFILES  (créé automatiquement à la 1ère connexion via trigger)
-- ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  plan       text not null default 'free',   -- 'free' | 'pro'
  created_at timestamptz default now()
);

-- trigger : crée le profil dès que l'utilisateur s'inscrit
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ────────────────────────────────────────────────────────────────
--  PROBLEMS
-- ────────────────────────────────────────────────────────────────
create table if not exists public.problems (
  id               text primary key,          -- slug ex: 'invoice-chasing'
  title            text not null,
  theme            text,
  mentions         integer default 0,
  trend_pct        integer default 0,
  is_hot           boolean default false,
  ai_brief         text,                       -- résumé court pour la card
  subtitle         text,                       -- label breadcrumb
  problem_code     text,                       -- 'PB-00042'
  source_posts     integer default 0,
  opportunity_score integer default 0,
  score_demand     integer default 0,
  score_competition integer default 0,
  score_opportunity integer default 0,
  verdict          text,
  product_angle    text,
  updated_at       timestamptz default now(),
  created_at       timestamptz default now()
);

create index if not exists problems_theme_idx    on public.problems(theme);
create index if not exists problems_mentions_idx on public.problems(mentions desc);
create index if not exists problems_title_trgm   on public.problems using gin(title gin_trgm_ops);

-- ────────────────────────────────────────────────────────────────
--  PROBLEM_SUMMARIES  (paragraphes IA)
-- ────────────────────────────────────────────────────────────────
create table if not exists public.problem_summaries (
  id         uuid primary key default gen_random_uuid(),
  problem_id text not null references public.problems(id) on delete cascade,
  content    text not null,
  position   integer not null
);

-- ────────────────────────────────────────────────────────────────
--  WEEKLY_DATAPOINTS  (graphe tendance)
-- ────────────────────────────────────────────────────────────────
create table if not exists public.weekly_datapoints (
  id         uuid primary key default gen_random_uuid(),
  problem_id text not null references public.problems(id) on delete cascade,
  week_label text,           -- 'W14', 'W15' …
  position   integer,        -- ordre chronologique
  mentions   integer
);

-- ────────────────────────────────────────────────────────────────
--  SOURCES  (posts Reddit / HN)
-- ────────────────────────────────────────────────────────────────
create table if not exists public.sources (
  id             uuid primary key default gen_random_uuid(),
  problem_id     text references public.problems(id) on delete cascade,
  platform       text check (platform in ('reddit','hn','forum')),
  subreddit      text,
  title          text,
  excerpt        text,
  upvotes        integer default 0,
  comments_count integer default 0,
  url            text,
  posted_at      text,
  raw_id         text,       -- id natif Reddit/HN pour dédupliquer
  created_at     timestamptz default now()
);

create unique index if not exists sources_raw_id_idx on public.sources(platform, raw_id)
  where raw_id is not null;

-- ────────────────────────────────────────────────────────────────
--  COMPETITORS
-- ────────────────────────────────────────────────────────────────
create table if not exists public.competitors (
  id         uuid primary key default gen_random_uuid(),
  problem_id text not null references public.problems(id) on delete cascade,
  icon       text,
  name       text,
  description text,
  gap_type   text check (gap_type in ('partial','none'))
);

-- ────────────────────────────────────────────────────────────────
--  SEGMENTS
-- ────────────────────────────────────────────────────────────────
create table if not exists public.segments (
  id         uuid primary key default gen_random_uuid(),
  problem_id text not null references public.problems(id) on delete cascade,
  name       text,
  percentage integer,
  position   integer
);

-- ────────────────────────────────────────────────────────────────
--  SAVED_PROBLEMS  (favoris utilisateur)
-- ────────────────────────────────────────────────────────────────
create table if not exists public.saved_problems (
  user_id    uuid not null references auth.users(id) on delete cascade,
  problem_id text not null references public.problems(id) on delete cascade,
  saved_at   timestamptz default now(),
  primary key (user_id, problem_id)
);

-- ================================================================
--  ROW LEVEL SECURITY
-- ================================================================

-- profiles : lecture sur son propre profil uniquement
alter table public.profiles enable row level security;
create policy "own profile" on public.profiles
  for all using (auth.uid() = id);

-- problems / summaries / sources / competitors / segments : lecture publique
alter table public.problems          enable row level security;
alter table public.problem_summaries enable row level security;
alter table public.weekly_datapoints enable row level security;
alter table public.sources           enable row level security;
alter table public.competitors       enable row level security;
alter table public.segments          enable row level security;

create policy "public read" on public.problems          for select using (true);
create policy "public read" on public.problem_summaries for select using (true);
create policy "public read" on public.weekly_datapoints for select using (true);
create policy "public read" on public.sources           for select using (true);
create policy "public read" on public.competitors       for select using (true);
create policy "public read" on public.segments          for select using (true);

-- écriture réservée au service_role (pipeline backend uniquement)
create policy "service write" on public.problems
  for all using (auth.role() = 'service_role');
create policy "service write" on public.problem_summaries
  for all using (auth.role() = 'service_role');
create policy "service write" on public.weekly_datapoints
  for all using (auth.role() = 'service_role');
create policy "service write" on public.sources
  for all using (auth.role() = 'service_role');
create policy "service write" on public.competitors
  for all using (auth.role() = 'service_role');
create policy "service write" on public.segments
  for all using (auth.role() = 'service_role');

-- saved_problems : chaque user gère ses propres favoris
alter table public.saved_problems enable row level security;
create policy "own saves" on public.saved_problems
  for all using (auth.uid() = user_id);
