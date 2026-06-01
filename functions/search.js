// ================================================================
//  Cloudflare Pages Function — GET /search?q=gaming
//  Scrape Reddit + HN → IA → sauvegarde en Supabase (non-bloquant)
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
    return Response.json({ error: 'Query too short' }, { status: 400, headers: corsHeaders });
  }

  // ── 0. Cache DB : résultats récents déjà en base ? ────────────
  if (env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY) {
    const cached = await fetchCached(query, env);
    if (cached && cached.length >= 2) {
      logEvent(env, 'search_cache_hit', { query });
      return Response.json({
        ideas: cached,
        query,
        posts_found: 0,
        from_cache: true,
        groq_active: false,
        saved_to_db: false,
      }, { headers: corsHeaders });
    }
  }

  // ── 1. Scraping parallèle Reddit + HN ─────────────────────────
  const [redditPosts, hnPosts] = await Promise.all([
    fetchReddit(query),
    fetchHN(query)
  ]);

  const allPosts = [...redditPosts, ...hnPosts];

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

  if (!ideas.length) {
    ideas = allPosts.slice(0, 5).map(p => ({
      title: p.title.slice(0, 80),
      problem: p.excerpt || p.title,
      opportunity: `SaaS opportunity based on real ${p.platform} complaints about "${query}"`,
      confidence: 50,
      mentions: p.upvotes
    }));
  }

  // ── 3. Réponse immédiate + sauvegarde en arrière-plan ─────────
  const savePromise = (ideas.length && env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY && groq_active)
    ? saveToSupabase(query, ideas, allPosts, env)
    : Promise.resolve();

  context.waitUntil(savePromise);   // non-bloquant — répond sans attendre

  return Response.json({
    ideas,
    query,
    posts_found: allPosts.length,
    groq_active,
    saved_to_db: groq_active && !!env.SUPABASE_URL,
    sources: allPosts.slice(0, 6).map(p => ({
      title: p.title.slice(0, 80), url: p.url,
      platform: p.platform, upvotes: p.upvotes
    }))
  }, { headers: corsHeaders });
}

// ── Cache DB : cherche des problèmes récents pour ce mot-clé ──
async function fetchCached(query, env) {
  try {
    const base = `${env.SUPABASE_URL}/rest/v1`;
    const h = {
      'apikey': env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
    };
    const res = await fetch(
      `${base}/problems?or=(title.ilike.*${encodeURIComponent(query)}*,ai_brief.ilike.*${encodeURIComponent(query)}*)&select=id,title,ai_brief,product_angle,score_demand,score_competition,score_opportunity,verdict,mentions&order=mentions.desc&limit=3`,
      { headers: h, signal: AbortSignal.timeout(2000) }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length < 2) return null;
    return rows.map(r => ({
      title:        r.title,
      problem:      r.ai_brief      || '',
      opportunity:  r.product_angle || '',
      confidence:   r.score_opportunity || 0,
      mentions:     r.mentions      || 0,
      score_demand:      r.score_demand      || 0,
      score_competition: r.score_competition || 0,
      score_opportunity: r.score_opportunity || 0,
      verdict:      r.verdict       || '',
    }));
  } catch { return null; }
}

// ── Reddit ─────────────────────────────────────────────────────
async function fetchReddit(query) {
  try {
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query + ' problem frustrating')}&sort=relevance&limit=12&type=link&t=month`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'painbase-search/1.0' },
      signal: AbortSignal.timeout(5000)
    });
    if (!res.ok) return [];
    const { data } = await res.json();
    return (data?.children || []).map(({ data: p }) => ({
      platform: 'reddit', raw_id: p.id,
      title: p.title, excerpt: (p.selftext || '').slice(0, 300),
      upvotes: p.score, subreddit: `r/${p.subreddit}`,
      url: `https://reddit.com${p.permalink}`
    })).filter(p => p.upvotes >= 2 && p.title.length > 12);
  } catch { return []; }
}

// ── Hacker News ────────────────────────────────────────────────
async function fetchHN(query) {
  try {
    const since = Math.floor(Date.now() / 1000) - 60 * 86400;
    const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=8&numericFilters=created_at_i>${since}`;
    const { hits } = await (await fetch(url, { signal: AbortSignal.timeout(4000) })).json();
    return (hits || []).map(h => ({
      platform: 'hn', raw_id: String(h.objectID),
      title: h.title, excerpt: (h.story_text || '').replace(/<[^>]+>/g, '').slice(0, 300),
      upvotes: h.points || 0, subreddit: 'Hacker News',
      url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`
    }));
  } catch { return []; }
}

// ── Groq — analyse complète ────────────────────────────────────
async function analyzeWithGroq(query, posts, apiKey) {
  const postList = posts.slice(0, 15).map((p, i) =>
    `${i+1}. [${p.platform.toUpperCase()}] (${p.upvotes} upvotes) ${p.title}${p.excerpt ? '\n   "' + p.excerpt.slice(0,150) + '"' : ''}`
  ).join('\n\n');

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', max_tokens: 1400, temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content:
`You are a startup analyst. Analyze these posts about "${query}" and return a SaaS opportunity report.

POSTS:
${postList}

Return EXACTLY this JSON:
{
  "ideas": [
    {
      "title": "10 words max — the core problem",
      "problem": "2-3 sentences: pain expressed in posts",
      "opportunity": "2 sentences: SaaS product that solves this",
      "product_angle": "3-4 sentences: product, target users, pricing ($X/month), edge over existing tools",
      "confidence": 78,
      "mentions": 1200,
      "score_demand": 75,
      "score_competition": 40,
      "score_opportunity": 72,
      "verdict": "Strong opportunity — high demand, fragmented supply",
      "summaries": [
        "3-4 sentences overview of the problem with data from posts",
        "3-4 sentences on current workarounds and why they fail",
        "3-4 sentences on what users ask for and willingness to pay"
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
      signal: AbortSignal.timeout(18000)
    });
    const data = await res.json();
    return JSON.parse(data?.choices?.[0]?.message?.content)?.ideas || [];
  } catch(e) { return []; }
}

// ── Sauvegarde Supabase ────────────────────────────────────────
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

    const check = await fetch(`${base}/problems?id=eq.${pid}&select=id,mentions`, { headers: h });
    const existing = await check.json().catch(() => []);

    if (Array.isArray(existing) && existing.length) {
      await fetch(`${base}/problems?id=eq.${pid}`, {
        method: 'PATCH', headers: h,
        body: JSON.stringify({ mentions: (existing[0].mentions||0)+1, updated_at: new Date().toISOString() })
      });
      continue;
    }

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

    // Saves in parallel for speed
    const saves = [];

    if (Array.isArray(idea.summaries) && idea.summaries.length) {
      saves.push(post('problem_summaries',
        idea.summaries.map((content, i) => ({ problem_id: pid, content, position: i }))
      ));
    }
    if (Array.isArray(idea.segments) && idea.segments.length) {
      saves.push(post('segments',
        idea.segments.map((s, i) => ({ problem_id: pid, name: s.name, percentage: s.pct, position: i }))
      ));
    }
    if (Array.isArray(idea.competitors) && idea.competitors.length) {
      saves.push(post('competitors',
        idea.competitors.map(c => ({
          problem_id: pid, icon: c.icon||'🔧', name: c.name,
          description: c.desc, gap_type: c.gap||'partial'
        }))
      ));
    }

    const srcBody = posts.slice(0, 8).map(p => ({
      problem_id: pid, platform: p.platform, subreddit: p.subreddit,
      title: p.title, excerpt: p.excerpt||'', upvotes: p.upvotes||0,
      url: p.url, raw_id: p.raw_id||String(Math.random()),
      posted_at: new Date().toISOString()
    }));
    saves.push(post('sources', srcBody, { 'Prefer': 'resolution=ignore-duplicates' }));

    await Promise.all(saves);
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
  const subs = posts.map(p => p.subreddit || '').join(' ').toLowerCase();
  for (const [pattern, theme] of Object.entries(themeMap)) {
    if (pattern.split('|').some(k => subs.includes(k))) return theme;
  }
  return 'Other';
}
