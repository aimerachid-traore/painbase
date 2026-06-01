// ================================================================
//  PainBase — Pipeline de collecte multi-sources
//  Sources :
//    ✓ Reddit       — JSON public (gratuit, sans clé)
//    ✓ Hacker News  — Algolia API (gratuit, sans clé)
//    ✓ Twitter / X  — Social Searcher API (100 req/jour gratuit)
//    ✓ Facebook     — Social Searcher API (même clé)
//    ✓ Instagram    — Social Searcher API (même clé)
//    ✓ Dev.to       — API officielle (gratuit, sans clé)
//
//  IA : Groq llama-3.1-8b-instant (14 400 req/jour gratuit)
//  DB : Supabase (service_role key)
// ================================================================

import 'dotenv/config';
import Groq from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// ── 1. Vérification des credentials ────────────────────────────
const CREDS = {
  supabase: !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
               && !process.env.SUPABASE_URL.includes('xxxx')),
  groq:     !!(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.startsWith('gsk_')),
  social:   !!(process.env.SOCIAL_SEARCHER_KEY && process.env.SOCIAL_SEARCHER_KEY.length > 10)
};

if (!CREDS.supabase) {
  console.error('❌  SUPABASE_URL ou SUPABASE_SERVICE_KEY manquant.');
  process.exit(1);
}

const sb   = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const groq = CREDS.groq ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

console.log('PainBase Pipeline — sources actives :');
console.log(`  Reddit     ✓ (JSON public)`);
console.log(`  HN         ✓ (Algolia)`);
console.log(`  Dev.to     ✓ (API publique)`);
console.log(`  Twitter/X  ${CREDS.social ? '✓' : '✗ (ajouter SOCIAL_SEARCHER_KEY)'}`);
console.log(`  Facebook   ${CREDS.social ? '✓' : '✗ (même clé)'}`);
console.log(`  Instagram  ${CREDS.social ? '✓' : '✗ (même clé)'}`);
console.log(`  IA Groq    ${CREDS.groq   ? '✓' : '✗ (ajouter GROQ_API_KEY)'}\n`);

// ── 2. Thèmes et mots-clés par source ──────────────────────────
const TOPICS = {
  'Productivity':     {
    reddit: ['productivity','todoist','notion','gettingthingsdone','selfimprovement'],
    keywords: ['productivity tool problem frustrated','task manager missing feature']
  },
  'Personal Finance': {
    reddit: ['personalfinance','freelance','smallbiz','FIRE','povertyfinance'],
    keywords: ['invoicing frustration freelance','budgeting app terrible']
  },
  'Health & Fitness': {
    reddit: ['EatCheapAndHealthy','Fitness','loseit','MealPrepSunday','nutrition'],
    keywords: ['meal planning app frustrating','fitness tracker problem']
  },
  'Parenting': {
    reddit: ['NewParents','beyondthebump','daddit','Mommit','Parenting'],
    keywords: ['parenting app useless','baby tracking problem']
  },
  'Developer Tools': {
    reddit: ['webdev','programming','SaaS','ExperiencedDevs','learnprogramming'],
    keywords: ['developer tool missing feature','coding frustration boilerplate']
  },
  'Marketing': {
    reddit: ['marketing','smallbusiness','SEO','Entrepreneur','startups'],
    keywords: ['marketing tool problem small business','social media management frustrating']
  },
  'Education': {
    reddit: ['college','GetStudying','learnmath','languagelearning','Teachers'],
    keywords: ['study app frustrating students','learning tool missing feature']
  },
  'Pets': {
    reddit: ['dogs','cats','puppy101','Pets','DogAdvice'],
    keywords: ['pet care app useless','vet tracking problem']
  }
};

// ── 3. Reddit — JSON public ─────────────────────────────────────
async function fetchReddit(subreddit, limit = 25) {
  try {
    const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'painbase-research/1.0' }
    });
    if (!res.ok) return [];
    const { data } = await res.json();
    return data.children
      .map(({ data: p }) => ({
        raw_id: p.id, platform: 'reddit', subreddit: `r/${subreddit}`,
        title: p.title, excerpt: (p.selftext||'').slice(0,600),
        upvotes: p.score, comments_count: p.num_comments,
        url: `https://reddit.com${p.permalink}`,
        posted_at: new Date(p.created_utc*1000).toISOString()
      }))
      .filter(p => p.upvotes > 5);
  } catch { return []; }
}

// ── 4. Hacker News — Algolia ────────────────────────────────────
async function fetchHN(query, limit = 20) {
  try {
    const since = Math.floor(Date.now()/1000) - 7*864e2;
    const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=${limit}&numericFilters=created_at_i>${since}`;
    const { hits } = await (await fetch(url)).json();
    return (hits||[]).map(h => ({
      raw_id: String(h.objectID), platform: 'hn', subreddit: 'Hacker News',
      title: h.title, excerpt: (h.story_text||'').replace(/<[^>]+>/g,'').slice(0,600),
      upvotes: h.points??0, comments_count: h.num_comments??0,
      url: h.url||`https://news.ycombinator.com/item?id=${h.objectID}`,
      posted_at: h.created_at
    }));
  } catch { return []; }
}

// ── 5. Dev.to — API officielle gratuite ─────────────────────────
async function fetchDevTo(tags, limit = 30) {
  const results = [];
  for (const tag of tags) {
    try {
      const url = `https://dev.to/api/articles?tag=${tag}&per_page=${limit}&state=fresh`;
      const posts = await (await fetch(url, { headers: { 'User-Agent': 'painbase-research/1.0' } })).json();
      if (!Array.isArray(posts)) continue;
      posts.forEach(p => results.push({
        raw_id: String(p.id), platform: 'devto', subreddit: 'dev.to',
        title: p.title, excerpt: p.description||'',
        upvotes: p.positive_reactions_count||0, comments_count: p.comments_count||0,
        url: p.url, posted_at: p.published_at
      }));
    } catch { continue; }
  }
  return results;
}

// ── 6. Social Searcher — Twitter, Facebook, Instagram ──────────
// Gratuit : 100 req/jour — https://www.social-searcher.com/api/
async function fetchSocial(query, networks = 'twitter,facebook,instagram') {
  if (!CREDS.social) return [];
  try {
    const url = `https://api.social-searcher.com/v2/search?q=${encodeURIComponent(query)}&key=${process.env.SOCIAL_SEARCHER_KEY}&limit=50&network=${networks}`;
    const res  = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.posts||[])
      .filter(p => p.text && p.text.length > 30)
      .map(p => ({
        raw_id: p.postid || p.url || String(Date.now()),
        platform: p.network || 'social',
        subreddit: `${p.network} / ${p.user?.name||'user'}`,
        title: (p.text||'').slice(0,150),
        excerpt: (p.text||'').slice(0,600),
        upvotes: p.sentiment === 'negative' ? 15 : 5,
        comments_count: 0,
        url: p.url||'',
        posted_at: p.posted || new Date().toISOString()
      }));
  } catch (err) {
    console.warn(`  Social Searcher: ${err.message}`);
    return [];
  }
}

// ── 7. Classification Groq ──────────────────────────────────────
const PROMPT = `You are a startup research analyst. Analyze this social media post.
Is it a REAL, UNSOLVED problem people would pay to fix?

Title: {TITLE}
Content: {CONTENT}
Source: {SOURCE}

Respond ONLY with JSON:
{"is_problem":true/false,"confidence":0-100,"theme":"Productivity|Personal Finance|Health & Fitness|Parenting|Developer Tools|Marketing|Education|Pets|Other","problem_title":"max 12 words","excerpt":"best 2-3 sentence quote"}`;

async function classify(post) {
  if (!groq) return { is_problem: false };
  try {
    const c = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      max_tokens: 300, temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [{ role:'user', content: PROMPT
        .replace('{TITLE}',   post.title)
        .replace('{CONTENT}', post.excerpt||'')
        .replace('{SOURCE}',  post.subreddit) }]
    });
    return JSON.parse(c.choices[0].message.content);
  } catch { return { is_problem: false }; }
}

// ── 8. Sauvegarde Supabase ──────────────────────────────────────
async function save(post, cls) {
  const { data: existing } = await sb.from('problems').select('id,mentions')
    .eq('theme', cls.theme)
    .ilike('title', `%${cls.problem_title.split(' ').slice(0,3).join('%')}%`)
    .limit(1).maybeSingle();

  let pid;
  if (existing) {
    pid = existing.id;
    await sb.from('problems').update({ mentions: existing.mentions+1, updated_at: new Date().toISOString() }).eq('id',pid);
  } else {
    pid = cls.problem_title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60);
    await sb.from('problems').upsert({ id:pid, title:cls.problem_title, theme:cls.theme,
      mentions:1, trend_pct:0, is_hot:false, ai_brief:cls.excerpt, source_posts:1
    }, { onConflict:'id' });
  }

  await sb.from('sources').upsert({
    problem_id: pid, platform: post.platform, subreddit: post.subreddit,
    title: post.title, excerpt: post.excerpt, upvotes: post.upvotes,
    comments_count: post.comments_count, url: post.url,
    posted_at: post.posted_at, raw_id: post.raw_id
  }, { onConflict:'platform,raw_id', ignoreDuplicates: true });
}

// ── 9. Trends semaine/semaine ───────────────────────────────────
async function updateTrends() {
  const w1 = new Date(Date.now()-7*864e5).toISOString();
  const w2 = new Date(Date.now()-14*864e5).toISOString();
  const { data } = await sb.from('problems').select('id');
  for (const { id } of data||[]) {
    const [{ count: a }, { count: b }] = await Promise.all([
      sb.from('sources').select('*',{count:'exact',head:true}).eq('problem_id',id).gte('created_at',w1),
      sb.from('sources').select('*',{count:'exact',head:true}).eq('problem_id',id).gte('created_at',w2).lt('created_at',w1)
    ]);
    await sb.from('problems').update({ trend_pct: b>0 ? Math.round(((a-b)/b)*100) : 0 }).eq('id',id);
  }
}

// ── 10. Main ────────────────────────────────────────────────────
async function main() {
  const start = Date.now();
  let total = 0, stored = 0;

  for (const [theme, cfg] of Object.entries(TOPICS)) {
    process.stdout.write(`\n[${theme}] `);

    const posts = [];

    // Reddit
    for (const sub of cfg.reddit) {
      posts.push(...await fetchReddit(sub));
      await new Promise(r => setTimeout(r, 1500));
    }

    // HN
    for (const kw of cfg.keywords) {
      posts.push(...await fetchHN(kw));
    }

    // Dev.to (pour Developer Tools et Education)
    if (['Developer Tools','Education','Marketing'].includes(theme)) {
      const devTags = { 'Developer Tools':['javascript','python','webdev'],
                        'Education':['learning','tutorial'], 'Marketing':['marketing','startup'] };
      posts.push(...await fetchDevTo(devTags[theme]||[]));
    }

    // Twitter, Facebook, Instagram
    for (const kw of cfg.keywords) {
      posts.push(...await fetchSocial(`${kw} -filter:links`));
      if (CREDS.social) await new Promise(r => setTimeout(r, 2000)); // rate limit
    }

    // Déduplication sur raw_id
    const seen = new Set();
    const unique = posts.filter(p => p.raw_id && !seen.has(p.raw_id) && seen.add(p.raw_id));
    total += unique.length;

    // Classify + save
    for (const post of unique) {
      const cls = await classify(post);
      if (cls.is_problem && cls.confidence >= 65) {
        await save(post, cls);
        stored++;
        process.stdout.write('✓');
      }
    }
  }

  console.log(`\n\n✅  ${total} posts analysés → ${stored} problèmes/sources sauvegardés`);
  console.log('Mise à jour des tendances…');
  await updateTrends();
  console.log(`Terminé en ${Math.round((Date.now()-start)/1000)}s`);
}

main().catch(err => { console.error('Pipeline error:', err.message); process.exit(1); });
