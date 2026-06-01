// ================================================================
//  Cloudflare Pages Function — GET /search?q=gaming
//  Scrape Reddit + HN en temps réel → IA → sauvegarde en Supabase
//
//  Env vars à définir dans Cloudflare Pages → Settings → Env vars :
//    GROQ_API_KEY          (requis pour l'analyse IA)
//    SUPABASE_URL          (pour sauvegarder les résultats)
//    SUPABASE_SERVICE_KEY  (clé service_role)
// ================================================================

export async function onRequestGet(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  const url   = new URL(request.url);
  const query = (url.searchParams.get('q') || '').trim().toLowerCase();

  if (!query || query.length < 2) {
    return Response.json({ error: 'Requête trop courte' }, { status: 400, headers: corsHeaders });
  }

  // ── 1. Scraping parallèle Reddit + HN ─────────────────────────
  const [redditPosts, hnPosts] = await Promise.all([
    fetchReddit(query),
    fetchHN(query)
  ]);

  const allPosts = [...redditPosts, ...hnPosts];

  // Log event search dans Supabase
  logEvent(env, 'search', { query, posts_found: allPosts.length });

  if (!allPosts.length) {
    return Response.json({ ideas: [], query, posts_found: 0, error_hint: 'no_posts' }, { headers: corsHeaders });
  }

  // ── 2. Analyse IA (Groq) ───────────────────────────────────────
  let ideas = [];
  let groq_active = false;

  if (env.GROQ_API_KEY) {
    ideas = await analyzeWithGroq(query, allPosts, env.GROQ_API_KEY);
    groq_active = true;
  }

  // Fallback si pas de clé Groq : génère des idées basiques à partir des posts
  if (!ideas.length) {
    ideas = allPosts.slice(0, 5).map(p => ({
      title: p.title.slice(0, 80),
      problem: p.excerpt || p.title,
      opportunity: `SaaS opportunity based on real ${p.platform} complaints about "${query}"`,
      confidence: 50,
      mentions: p.upvotes
    }));
  }

  // ── 3. Sauvegarde en Supabase (nouveaux problèmes uniquement) ──
  if (ideas.length && env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY && groq_active) {
    await saveToSupabase(query, ideas, allPosts, env);
  }

  return Response.json({
    ideas,
    query,
    posts_found: allPosts.length,
    groq_active,
    saved_to_db: groq_active && !!env.SUPABASE_URL,
    sources: allPosts.slice(0, 6).map(p => ({ title: p.title.slice(0,80), url: p.url, platform: p.platform, upvotes: p.upvotes }))
  }, { headers: corsHeaders });
}

// ── Reddit ─────────────────────────────────────────────────────
async function fetchReddit(query) {
  try {
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query + ' problem frustrating')}&sort=relevance&limit=20&type=link&t=month`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'painbase-search/1.0' },
      signal: AbortSignal.timeout(7000)
    });
    if (!res.ok) return [];
    const { data } = await res.json();
    return (data?.children || []).map(({ data: p }) => ({
      platform: 'reddit', raw_id: p.id,
      title: p.title, excerpt: (p.selftext || '').slice(0, 400),
      upvotes: p.score, subreddit: `r/${p.subreddit}`,
      url: `https://reddit.com${p.permalink}`
    })).filter(p => p.upvotes >= 2 && p.title.length > 12);
  } catch { return []; }
}

// ── Hacker News ────────────────────────────────────────────────
async function fetchHN(query) {
  try {
    const since = Math.floor(Date.now() / 1000) - 60 * 86400;
    const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=15&numericFilters=created_at_i>${since}`;
    const { hits } = await (await fetch(url, { signal: AbortSignal.timeout(5000) })).json();
    return (hits || []).map(h => ({
      platform: 'hn', raw_id: String(h.objectID),
      title: h.title, excerpt: (h.story_text || '').replace(/<[^>]+>/g, '').slice(0, 400),
      upvotes: h.points || 0, subreddit: 'Hacker News',
      url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`
    }));
  } catch { return []; }
}

// ── Groq — analyse complète ────────────────────────────────────
async function analyzeWithGroq(query, posts, apiKey) {
  const postList = posts.slice(0, 20).map((p, i) =>
    `${i+1}. [${p.platform.toUpperCase()}] (${p.upvotes} upvotes) ${p.title}${p.excerpt ? '\n   "' + p.excerpt.slice(0,180) + '"' : ''}`
  ).join('\n\n');

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', max_tokens: 2000, temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content:
`You are a senior startup analyst. Analyze these REAL posts about "${query}" and generate a complete SaaS opportunity report.

POSTS:
${postList}

Return EXACTLY this JSON (no extra fields, all fields required):
{
  "ideas": [
    {
      "title": "10 words max — the core problem",
      "problem": "2-3 sentences: what pain do people express in these posts?",
      "opportunity": "2 sentences: what SaaS product solves this and how?",
      "product_angle": "4-5 sentences: describe the product, target users, key features, pricing model ($X/month), why it beats existing tools",
      "confidence": 78,
      "mentions": 1200,
      "score_demand": 75,
      "score_competition": 40,
      "score_opportunity": 72,
      "verdict": "Strong opportunity — high demand, fragmented supply",
      "summaries": [
        "3-4 sentences: overview of the problem with data from the posts",
        "3-4 sentences: current workarounds and why they fail",
        "3-4 sentences: what users specifically ask for and willingness to pay signals"
      ],
      "segments": [
        {"name": "Segment A", "pct": 45},
        {"name": "Segment B", "pct": 35},
        {"name": "Segment C", "pct": 20}
      ],
      "competitors": [
        {"icon": "🔧", "name": "Tool name", "desc": "What it does and its gap", "gap": "partial"},
        {"icon": "📊", "name": "Tool name", "desc": "What it does and its gap", "gap": "none"}
      ]
    }
  ]
}` }]
      }),
      signal: AbortSignal.timeout(25000)
    });
    const data = await res.json();
    return JSON.parse(data?.choices?.[0]?.message?.content)?.ideas || [];
  } catch(e) { return []; }
}

// ── Sauvegarde Supabase — complète ────────────────────────────
async function saveToSupabase(query, ideas, posts, env) {
  const base = `${env.SUPABASE_URL}/rest/v1`;
  const h = {
    'apikey': env.SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
  };
  const post = (path, body, extra={}) => fetch(`${base}/${path}`, {
    method: 'POST', headers: { ...h, ...extra }, body: JSON.stringify(body)
  });

  const theme = guessTheme(query, posts);

  for (const idea of ideas.slice(0, 3)) {
    const pid = (idea.title || query).toLowerCase()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

    // Vérifie si le problème existe déjà
    const check = await fetch(`${base}/problems?id=eq.${pid}&select=id,mentions`, { headers: h });
    const existing = await check.json().catch(() => []);

    if (Array.isArray(existing) && existing.length) {
      await fetch(`${base}/problems?id=eq.${pid}`, {
        method: 'PATCH', headers: h,
        body: JSON.stringify({ mentions: (existing[0].mentions||0)+1, updated_at: new Date().toISOString() })
      });
      continue; // Déjà en base avec tous les détails
    }

    // ── Crée le problème avec tous les scores ─────────────────
    await post('problems', {
      id: pid, title: idea.title, theme,
      mentions: idea.mentions || 1, trend_pct: 0, is_hot: false,
      ai_brief:           idea.problem,
      product_angle:      idea.product_angle || idea.opportunity,
      source_posts:       posts.length,
      score_demand:       idea.score_demand      || 0,
      score_competition:  idea.score_competition || 0,
      score_opportunity:  idea.score_opportunity || 0,
      opportunity_score:  idea.score_opportunity || 0,
      verdict:            idea.verdict           || '',
    }, { 'Prefer': 'resolution=ignore-duplicates' });

    // ── Résumés IA (3 paragraphes) ────────────────────────────
    if (Array.isArray(idea.summaries) && idea.summaries.length) {
      await post('problem_summaries',
        idea.summaries.map((content, i) => ({ problem_id: pid, content, position: i }))
      );
    }

    // ── Segments ──────────────────────────────────────────────
    if (Array.isArray(idea.segments) && idea.segments.length) {
      await post('segments',
        idea.segments.map((s, i) => ({ problem_id: pid, name: s.name, percentage: s.pct, position: i }))
      );
    }

    // ── Compétiteurs ──────────────────────────────────────────
    if (Array.isArray(idea.competitors) && idea.competitors.length) {
      await post('competitors',
        idea.competitors.map(c => ({
          problem_id: pid, icon: c.icon||'🔧', name: c.name,
          description: c.desc, gap_type: c.gap||'partial'
        }))
      );
    }

    // ── Sources ───────────────────────────────────────────────
    const srcBody = posts.slice(0, 8).map(p => ({
      problem_id: pid, platform: p.platform, subreddit: p.subreddit,
      title: p.title, excerpt: p.excerpt||'', upvotes: p.upvotes||0,
      url: p.url, raw_id: p.raw_id||String(Math.random()),
      posted_at: new Date().toISOString()
    }));
    await post('sources', srcBody, { 'Prefer': 'resolution=ignore-duplicates' });
  }
}

// ── Log event analytics ────────────────────────────────────────
async function logEvent(env, type, data) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) return;
  try {
    await fetch(`${env.SUPABASE_URL}/rest/v1/events`, {
      method: 'POST',
      headers: {
        'apikey': env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type, data: JSON.stringify(data), created_at: new Date().toISOString() })
    });
  } catch {}
}

// ── Devine le thème depuis le mot-clé ─────────────────────────
function guessTheme(query, posts) {
  const themeMap = {
    'gaming|game|gamer|esport':                  'Gaming',
    'travel|trip|flight|hotel|visa':             'Travel',
    'remote|freelance|work from home|async':     'Remote Work',
    'shop|ecommerce|store|amazon|etsy|sell':     'E-commerce',
    'mental|anxiety|depression|therapy|stress':  'Mental Health',
    'real estate|property|rent|landlord|tenant': 'Real Estate',
    'hire|recruit|job|cv|resume|interview':      'Recruiting & HR',
    'instagram|tiktok|youtube|content|social':   'Social Media',
    'invest|crypto|stock|bitcoin|portfolio':     'Finance & Investing',
    'restaurant|food|menu|chef|delivery':        'Food & Restaurant',
    'home|diy|renovation|garden|contractor':     'Home & DIY',
    'legal|law|contract|compliance|gdpr':        'Legal & Compliance',
    'dog|cat|pet|vet|animal':                    'Pets',
    'parent|baby|kid|child|toddler':             'Parenting',
    'study|learn|school|course|student':         'Education',
    'health|fitness|gym|diet|weight':            'Health & Fitness',
    'budget|finance|money|invoice|bill':         'Personal Finance',
    'dev|code|api|app|software|saas':            'Developer Tools',
    'market|seo|ads|email|campaign':             'Marketing',
  };
  const q = query.toLowerCase();
  for (const [pattern, theme] of Object.entries(themeMap)) {
    if (pattern.split('|').some(k => q.includes(k))) return theme;
  }
  // Regarde dans les subreddits des posts
  const subs = posts.map(p => p.subreddit || '').join(' ').toLowerCase();
  for (const [pattern, theme] of Object.entries(themeMap)) {
    if (pattern.split('|').some(k => subs.includes(k))) return theme;
  }
  return 'Other';
}
