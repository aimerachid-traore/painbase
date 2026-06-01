-- ================================================================
--  Table d'analytics — à coller dans Supabase → SQL Editor → Run
-- ================================================================

CREATE TABLE IF NOT EXISTS events (
  id         BIGSERIAL PRIMARY KEY,
  type       TEXT NOT NULL,   -- 'view' | 'search' | 'save' | 'signup'
  data       JSONB,           -- { problem_id, query, theme, ... }
  user_id    UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requêtes analytics
CREATE INDEX IF NOT EXISTS events_type_idx       ON events (type);
CREATE INDEX IF NOT EXISTS events_created_at_idx ON events (created_at DESC);

-- RLS : service_role peut tout écrire, anon peut insérer
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert_events" ON events FOR INSERT WITH CHECK (true);
CREATE POLICY "service_read_events" ON events FOR SELECT USING (true);
