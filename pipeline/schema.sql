-- ================================================================
--  PainBase — Schéma Supabase complet
--  Colle ce SQL dans Supabase > SQL Editor > New query > Run
-- ================================================================

-- ── Tables principales ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS problems (
  id               TEXT PRIMARY KEY,
  title            TEXT NOT NULL,
  theme            TEXT,
  mentions         INTEGER DEFAULT 1,
  trend_pct        INTEGER DEFAULT 0,
  is_hot           BOOLEAN DEFAULT false,
  ai_brief         TEXT,
  subtitle         TEXT,
  problem_code     TEXT,
  source_posts     INTEGER DEFAULT 0,
  opportunity_score INTEGER,
  score_demand     INTEGER,
  score_competition INTEGER,
  score_opportunity INTEGER,
  verdict          TEXT,
  product_angle    TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS problem_summaries (
  id         BIGSERIAL PRIMARY KEY,
  problem_id TEXT REFERENCES problems(id) ON DELETE CASCADE,
  content    TEXT,
  position   INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS weekly_datapoints (
  id         BIGSERIAL PRIMARY KEY,
  problem_id TEXT REFERENCES problems(id) ON DELETE CASCADE,
  week_label TEXT,
  position   INTEGER DEFAULT 0,
  mentions   INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sources (
  id             BIGSERIAL PRIMARY KEY,
  problem_id     TEXT REFERENCES problems(id) ON DELETE CASCADE,
  platform       TEXT,
  subreddit      TEXT,
  title          TEXT,
  excerpt        TEXT,
  upvotes        INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  url            TEXT,
  posted_at      TIMESTAMPTZ,
  raw_id         TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(platform, raw_id)
);

CREATE TABLE IF NOT EXISTS competitors (
  id          BIGSERIAL PRIMARY KEY,
  problem_id  TEXT REFERENCES problems(id) ON DELETE CASCADE,
  icon        TEXT,
  name        TEXT,
  description TEXT,
  gap_type    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS segments (
  id          BIGSERIAL PRIMARY KEY,
  problem_id  TEXT REFERENCES problems(id) ON DELETE CASCADE,
  name        TEXT,
  percentage  INTEGER,
  position    INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS saved_problems (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id  TEXT REFERENCES problems(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, problem_id)
);

CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan       TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Row Level Security ──────────────────────────────────────────

ALTER TABLE problems          ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_datapoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources           ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors       ENABLE ROW LEVEL SECURITY;
ALTER TABLE segments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_problems    ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;

-- Lecture publique (données visibles sans compte)
CREATE POLICY IF NOT EXISTS "public_read_problems"   ON problems          FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "public_read_summaries"  ON problem_summaries FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "public_read_datapoints" ON weekly_datapoints  FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "public_read_sources"    ON sources            FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "public_read_competitors"ON competitors         FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "public_read_segments"   ON segments            FOR SELECT USING (true);

-- saved_problems : chaque user voit/modifie seulement ses favoris
CREATE POLICY IF NOT EXISTS "saved_select" ON saved_problems FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "saved_insert" ON saved_problems FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "saved_delete" ON saved_problems FOR DELETE USING (auth.uid() = user_id);

-- profiles : chaque user voit/modifie son propre profil
CREATE POLICY IF NOT EXISTS "profile_select" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY IF NOT EXISTS "profile_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- ── Trigger : crée le profil automatiquement à l'inscription ───

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, plan)
  VALUES (NEW.id, 'free')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
