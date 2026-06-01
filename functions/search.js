// ================================================================
//  Cloudflare Pages Function — /search?q=gaming
//  Scrape Reddit + HN en temps réel et retourne des idées SaaS via IA
//  Env vars (Cloudflare Pages → Settings → Environment variables) :
//    GROQ_API_KEY  →  clé Groq
// ================================================================

export async function onRequestGet(context) {
  const { request, env } = context;

  // CORS — autorise toutes les origines (site public)
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  const url   = new URL(request.url);
  const query = (url.searchParams.get('q') || '').trim();

  if (!query || query.length < 2) {
    return new Response(JSON.stringify({ error: 'Requête trop courte' }), { status: 400, headers });
  }

  // ── 1. Reddit — recherche publique ────────────────────────────
  const redditPosts = await fetchReddit(query);

  // ── 2. Hacker News — Algolia ──────────────────────────────────
  const hnPosts = await fetchHN(query);

  const allPosts = [...redditPosts, ...hnPosts].slice(0, 25);

  if (!allPosts.length) {
    return new Response(JSON.stringify({ ideas: [], query, posts_found: 0 }), { headers });
  }

  // ── 3. Groq IA → idées SaaS ───────────────────────────────────
  const ideas = await analyzeWithGroq(query, allPosts, env.GROQ_API_KEY);

  return new Response(JSON.stringify({
    ideas,
    query,
    posts_found: allPosts.length,
    sources: allPosts.slice(0, 5).map(p => ({ title: p.title, url: p.url, platform: p.platform }))
  }), { headers });
}

// ── Reddit search ──────────────────────────────────────────────
async function fetchReddit(query) {
  try {
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query + ' problem frustrating missing')}&sort=relevance&limit=20&type=link`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'painbase-search/1.0' },
      signal: AbortSignal.timeout(6000)
    });
    if (!res.ok) return [];
    const { data } = await res.json();
    return (data?.children || []).map(({ data: p }) => ({
      platform: 'reddit',
      title: p.title,
      excerpt: (p.selftext || '').slice(0, 400),
      upvotes: p.score,
      url: `https://reddit.com${p.permalink}`
    })).filter(p => p.upvotes > 3 && p.title.length > 15);
  } catch { return []; }
}

// ── HN Algolia ─────────────────────────────────────────────────
async function fetchHN(query) {
  try {
    const since = Math.floor(Date.now() / 1000) - 30 * 86400; // 30 derniers jours
    const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=15&numericFilters=created_at_i>${since}`;
    const { hits } = await (await fetch(url, { signal: AbortSignal.timeout(5000) })).json();
    return (hits || []).map(h => ({
      platform: 'hn',
      title: h.title,
      excerpt: (h.story_text || '').replace(/<[^>]+>/g, '').slice(0, 400),
      upvotes: h.points || 0,
      url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`
    }));
  } catch { return []; }
}

// ── Groq IA ────────────────────────────────────────────────────
async function analyzeWithGroq(query, posts, apiKey) {
  if (!apiKey) return [];
  const postList = posts.map((p, i) => `${i+1}. [${p.platform.toUpperCase()}] ${p.title}`).join('\n');
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        max_tokens: 800,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [{
          role: 'user',
          content: `You are a startup analyst. Based on these REAL posts about "${query}", identify 4-6 SaaS opportunities.

Posts:
${postList}

Return JSON only:
{"ideas":[
  {
    "title": "12-word problem description max",
    "problem": "2 sentences describing the real pain point",
    "opportunity": "1 sentence on the SaaS solution",
    "confidence": 0-100,
    "mentions": estimated number of affected people
  }
]}`
        }]
      }),
      signal: AbortSignal.timeout(15000)
    });
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    return JSON.parse(content)?.ideas || [];
  } catch { return []; }
}
