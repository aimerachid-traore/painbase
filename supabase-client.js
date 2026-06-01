// ================================================================
//  supabase-client.js
//  Dépendances (chargées via CDN dans le HTML) :
//    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
//    <script src="supabase.config.js"></script>
// ================================================================

const _sb = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// ── AUTH  (tout géré par Supabase — zéro logique custom) ────────
const PBAuth = {
  signUp: (email, pw)  => _sb.auth.signUp({ email, password: pw }),
  signIn: (email, pw)  => _sb.auth.signInWithPassword({ email, password: pw }),
  signOut: ()          => _sb.auth.signOut(),
  resetPassword: email => _sb.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/painbase-landing.html'
  }),

  // Lecture rapide depuis localStorage (pas d'appel réseau)
  getSession: async () => {
    const { data: { session } } = await _sb.auth.getSession();
    return session?.user ?? null;
  },

  // Vérification serveur (plus sûr mais plus lent)
  getUser: async () => {
    const { data: { user } } = await _sb.auth.getUser();
    return user;
  },

  onAuthChange: cb => _sb.auth.onAuthStateChange((_event, session) => cb(session?.user ?? null))
};

// ── DATA ─────────────────────────────────────────────────────────
const PBData = {

  // Liste des problèmes (pour la landing + leaderboard)
  async getProblems({ theme, search } = {}) {
    let q = _sb.from('problems').select('*');
    if (theme && theme !== 'all') q = q.eq('theme', theme);
    if (search) q = q.or(
      `title.ilike.%${search}%,ai_brief.ilike.%${search}%,theme.ilike.%${search}%`
    );
    q = q.order('mentions', { ascending: false });
    const { data, error } = await q;
    return { data, error };
  },

  // Détail complet d'un problème
  async getProblem(id) {
    const [prob, summaries, weekly, srcs, comps, segs] = await Promise.all([
      _sb.from('problems').select('*').eq('id', id).single(),
      _sb.from('problem_summaries').select('*').eq('problem_id', id).order('position'),
      _sb.from('weekly_datapoints').select('*').eq('problem_id', id).order('position'),
      _sb.from('sources').select('*').eq('problem_id', id).order('upvotes', { ascending: false }).limit(5),
      _sb.from('competitors').select('*').eq('problem_id', id),
      _sb.from('segments').select('*').eq('problem_id', id).order('position')
    ]);
    if (prob.error) return { data: null, error: prob.error };
    return {
      data: {
        ...prob.data,
        summaries: summaries.data ?? [],
        weeklyData: (weekly.data ?? []).map(r => r.mentions),
        sources:    srcs.data    ?? [],
        competitors: comps.data  ?? [],
        segments:   segs.data    ?? []
      },
      error: null
    };
  },

  // Problèmes liés (même thème)
  async getRelated(id, theme, limit = 3) {
    const { data } = await _sb.from('problems')
      .select('id, title, theme, mentions, trend_pct')
      .eq('theme', theme)
      .neq('id', id)
      .order('mentions', { ascending: false })
      .limit(limit);
    return data ?? [];
  },

  // Favoris
  async saveProblem(problemId) {
    const user = await PBAuth.getUser();
    if (!user) return { error: 'not_authenticated' };
    return _sb.from('saved_problems').insert({ user_id: user.id, problem_id: problemId });
  },

  async unsaveProblem(problemId) {
    const user = await PBAuth.getUser();
    if (!user) return { error: 'not_authenticated' };
    return _sb.from('saved_problems').delete()
      .match({ user_id: user.id, problem_id: problemId });
  },

  async getSavedIds() {
    const user = await PBAuth.getUser();
    if (!user) return [];
    const { data } = await _sb.from('saved_problems')
      .select('problem_id').eq('user_id', user.id);
    return (data ?? []).map(r => r.problem_id);
  }
};

// Détecte si Supabase est configuré (clé non-placeholder)
const PB_CONFIGURED = !SUPABASE_CONFIG.url.includes('YOUR_SUPABASE');
