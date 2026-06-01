// ================================================================
//  PainBase — Pipeline multi-sources
//
//  SOURCE         | CLÉ REQUISE          | COÛT
//  ---------------|----------------------|------------------
//  Reddit         | aucune               | gratuit
//  Hacker News    | aucune               | gratuit
//  Dev.to         | aucune               | gratuit
//  Twitter / X    | aucune (Nitter RSS)  | gratuit
//  Facebook       | APIFY_TOKEN          | $5 crédit/mois offert
//  IA (Groq)      | GROQ_API_KEY         | 14 400 req/jour gratuit
// ================================================================
import 'dotenv/config';
import Groq  from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// ── Credentials ─────────────────────────────────────────────────
const OK = {
  supabase : !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
                && !process.env.SUPABASE_URL.includes('xxxx')),
  groq     : !!(process.env.GROQ_API_KEY?.startsWith('gsk_')),
  apify    : !!(process.env.APIFY_TOKEN?.length > 10),
};

if (!OK.supabase) {
  console.error('❌  SUPABASE_URL / SUPABASE_SERVICE_KEY manquant dans .env');
  process.exit(1);
}

// Vérifie que la clé est bien la service_role (pas la clé anon)
try {
  const payload = JSON.parse(Buffer.from(process.env.SUPABASE_SERVICE_KEY.split('.')[1], 'base64').toString());
  if (payload.role !== 'service_role') {
    console.error('❌  SUPABASE_SERVICE_KEY est la clé "anon", pas "service_role".');
    console.error('   → Va sur Supabase > Settings > API > service_role key');
    console.error('   → Remplace SUPABASE_SERVICE_KEY dans pipeline/.env');
    process.exit(1);
  }
} catch { /* si le JWT ne se parse pas, on laisse passer */ }

const sb   = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const groq = OK.groq ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

// ── Pré-check : connexion DB ────────────────────────────────────
const { error: dbErr } = await sb.from('problems').select('id').limit(1);
if (dbErr) {
  console.error('❌  Impossible de lire la table "problems" :', dbErr.message);
  console.error('   → Vérifie que tu as exécuté pipeline/schema.sql dans Supabase SQL Editor');
  process.exit(1);
}

// ── Pré-check : clé Groq ─────────────────────────────────────────
if (OK.groq) {
  try {
    await groq.chat.completions.create({
      model:'llama-3.1-8b-instant', max_tokens:5,
      messages:[{ role:'user', content:'ok' }]
    });
  } catch(err) {
    console.error('❌  Clé Groq invalide (erreur 401) :', err.message.slice(0, 60));
    console.error('   → Va sur https://console.groq.com → API Keys → Create API Key');
    console.error('   → Remplace GROQ_API_KEY dans pipeline/.env avec la nouvelle clé');
    process.exit(1);
  }
}

console.log('── Sources actives ──────────────────────────────────');
console.log('  Reddit     ✓  (JSON public, sans clé)');
console.log('  Hacker News✓  (Algolia, sans clé)');
console.log('  Dev.to     ✓  (API publique, sans clé)');
console.log(`  Twitter/X  ✓  (Nitter RSS, sans clé)`);
console.log(`  Facebook   ${OK.apify ? '✓  (Apify)' : '✗  → ajouter APIFY_TOKEN dans .env'}`);
console.log(`  IA Groq    ${OK.groq  ? '✓  (llama-3.1-8b-instant)' : '✗  → ajouter GROQ_API_KEY dans .env'}`);
console.log('─────────────────────────────────────────────────────\n');

// ── Thèmes ───────────────────────────────────────────────────────
const TOPICS = {
  'Productivity'    : { reddit:['productivity','todoist','notion','gettingthingsdone'],
                         kw:['productivity app problem frustrated','task manager missing feature'] },
  'Personal Finance': { reddit:['personalfinance','freelance','smallbiz','povertyfinance'],
                         kw:['budgeting app terrible','invoicing problem freelance'] },
  'Health & Fitness': { reddit:['EatCheapAndHealthy','Fitness','loseit','MealPrepSunday'],
                         kw:['meal planner frustrating allergy','fitness app broken'] },
  'Parenting'       : { reddit:['NewParents','beyondthebump','daddit','Parenting'],
                         kw:['parenting app useless newborn','baby tracker problem'] },
  'Developer Tools' : { reddit:['webdev','programming','SaaS','ExperiencedDevs'],
                         kw:['developer tool frustrating','boilerplate problem auth billing'] },
  'Marketing'       : { reddit:['marketing','smallbusiness','Entrepreneur','startups'],
                         kw:['marketing tool missing feature','social media management problem'] },
  'Education'       : { reddit:['college','GetStudying','Teachers','languagelearning'],
                         kw:['study app frustrating students','learning platform broken'] },
  'Pets'            : { reddit:['dogs','cats','Pets','DogAdvice'],
                         kw:['pet care app useless','vet tracking problem'] },
};

// ════════════════════════════════════════════════════════════════
//  SOURCES
// ════════════════════════════════════════════════════════════════

// ── Reddit — JSON public ─────────────────────────────────────────
async function fetchReddit(sub, limit = 25) {
  try {
    const res = await fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=${limit}`, {
      headers: { 'User-Agent': 'painbase-research/1.0' }
    });
    if (!res.ok) return [];
    const { data } = await res.json();
    return data.children
      .map(({ data: p }) => ({
        raw_id: p.id, platform:'reddit', subreddit:`r/${sub}`,
        title: p.title, excerpt:(p.selftext||'').slice(0,600),
        upvotes: p.score, comments_count: p.num_comments,
        url:`https://reddit.com${p.permalink}`,
        posted_at: new Date(p.created_utc*1000).toISOString()
      }))
      .filter(p => p.upvotes > 5 && p.title.length > 20);
  } catch { return []; }
}

// ── Hacker News — Algolia ────────────────────────────────────────
async function fetchHN(query, limit = 20) {
  try {
    const since = Math.floor(Date.now()/1000) - 7*86400;
    const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=${limit}&numericFilters=created_at_i>${since}`;
    const { hits } = await (await fetch(url)).json();
    return (hits||[]).map(h => ({
      raw_id: String(h.objectID), platform:'hn', subreddit:'Hacker News',
      title: h.title, excerpt:(h.story_text||'').replace(/<[^>]+>/g,'').slice(0,600),
      upvotes: h.points||0, comments_count: h.num_comments||0,
      url: h.url||`https://news.ycombinator.com/item?id=${h.objectID}`,
      posted_at: h.created_at
    }));
  } catch { return []; }
}

// ── Dev.to — API officielle gratuite ────────────────────────────
const DEVTO_TAGS = {
  'Developer Tools' :['javascript','node','webdev','devops'],
  'Marketing'       :['marketing','startup','business'],
  'Education'       :['learning','career'],
  'Productivity'    :['productivity','tools'],
};
async function fetchDevTo(theme) {
  const tags = DEVTO_TAGS[theme]; if (!tags) return [];
  const results = [];
  for (const tag of tags) {
    try {
      const posts = await (await fetch(
        `https://dev.to/api/articles?tag=${tag}&per_page=20&state=fresh`,
        { headers:{'User-Agent':'painbase-research/1.0'} }
      )).json();
      if (!Array.isArray(posts)) continue;
      posts.forEach(p => results.push({
        raw_id: String(p.id), platform:'devto', subreddit:'dev.to',
        title: p.title, excerpt: p.description||'',
        upvotes: p.positive_reactions_count||0, comments_count: p.comments_count||0,
        url: p.url, posted_at: p.published_at
      }));
    } catch { continue; }
  }
  return results;
}

// ── Twitter / X — Nitter RSS (open source, sans clé) ────────────
// Nitter = miroir open source de Twitter, accessible librement
const NITTER = [
  'https://nitter.poast.org',
  'https://nitter.privacydev.net',
  'https://nitter.catsarch.com',
  'https://nitter.1d4.us',
];

async function fetchTwitter(query, limit = 20) {
  for (const host of NITTER) {
    try {
      const url = `${host}/search/rss?q=${encodeURIComponent(query)}&f=tweets`;
      const res = await fetch(url, {
        headers:{ 'User-Agent':'painbase-research/1.0', 'Accept':'application/rss+xml,text/xml' },
        signal: AbortSignal.timeout(8000)
      });
      if (!res.ok) continue;
      const xml = await res.text();
      const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, limit);
      if (!items.length) continue;
      return items.map(([,item]) => {
        const g  = (re) => (item.match(re)||[])[1]||'';
        const txt = g(/<description><!\[CDATA\[([\s\S]*?)\]\]>/).replace(/<[^>]+>/g,'').trim();
        const lnk = g(/<link>(.*?)<\/link>/);
        const id  = lnk.split('/').pop() || String(Math.random());
        return {
          raw_id: id, platform:'twitter', subreddit:'Twitter/X',
          title: txt.slice(0,150), excerpt: txt.slice(0,600),
          upvotes: 10, comments_count: 0,
          url: lnk.replace(host, 'https://twitter.com'),
          posted_at: new Date(g(/<pubDate>(.*?)<\/pubDate>/)||Date.now()).toISOString()
        };
      }).filter(p => p.excerpt.length > 20);
    } catch { continue; }
  }
  console.warn('  Twitter: aucune instance Nitter disponible en ce moment');
  return [];
}

// ── Facebook — Apify (gratuit $5/mois) ──────────────────────────
// Inscription : https://apify.com → gratuit → Console → API token
async function fetchFacebook(query, limit = 20) {
  if (!OK.apify) return [];
  try {
    // Utilise l'acteur Apify pour scraper les posts Facebook publics
    const runUrl = `https://api.apify.com/v2/acts/apify~facebook-posts-scraper/run-sync-get-dataset-items?token=${process.env.APIFY_TOKEN}&timeout=60`;
    const res = await fetch(runUrl, {
      method : 'POST',
      headers: { 'Content-Type':'application/json' },
      body   : JSON.stringify({
        startUrls : [{ url:`https://www.facebook.com/search/posts/?q=${encodeURIComponent(query)}` }],
        maxPostCount: limit,
        scrapeAbout : false,
        scrapeReviews: false
      }),
      signal: AbortSignal.timeout(60000)
    });
    if (!res.ok) return [];
    const posts = await res.json();
    return (Array.isArray(posts) ? posts : []).map(p => ({
      raw_id: p.postId || p.url || String(Math.random()),
      platform:'facebook', subreddit:'Facebook',
      title  : (p.text||'').slice(0,150),
      excerpt: (p.text||'').slice(0,600),
      upvotes: p.likes||0, comments_count: p.comments||0,
      url    : p.url||'', posted_at: p.time||new Date().toISOString()
    })).filter(p => p.excerpt.length > 20);
  } catch (err) {
    console.warn(`  Facebook: ${err.message}`);
    return [];
  }
}

// ════════════════════════════════════════════════════════════════
//  IA — Classification Groq
// ════════════════════════════════════════════════════════════════
const PROMPT = `You are a startup analyst. Is this post describing a REAL unsolved problem people would pay to fix?

Title: {TITLE}
Content: {CONTENT}
Source: {SOURCE}

JSON only:
{"is_problem":true/false,"confidence":0-100,"theme":"Productivity|Personal Finance|Health & Fitness|Parenting|Developer Tools|Marketing|Education|Pets|Other","problem_title":"max 12 words","excerpt":"best 2-3 sentences"}`;

async function classify(post) {
  if (!groq) return { is_problem: false };
  try {
    const c = await groq.chat.completions.create({
      model:'llama-3.1-8b-instant', max_tokens:300, temperature:0.1,
      response_format:{ type:'json_object' },
      messages:[{ role:'user', content: PROMPT
        .replace('{TITLE}',   post.title)
        .replace('{CONTENT}', post.excerpt||'')
        .replace('{SOURCE}',  post.subreddit) }]
    });
    return JSON.parse(c.choices[0].message.content);
  } catch(err) {
    process.stdout.write(`[Groq err: ${err.message.slice(0,40)}]`);
    return { is_problem:false };
  }
}

// ════════════════════════════════════════════════════════════════
//  DB — Sauvegarde Supabase
// ════════════════════════════════════════════════════════════════
async function save(post, cls) {
  const { data: existing } = await sb.from('problems').select('id,mentions')
    .eq('theme', cls.theme)
    .ilike('title', `%${cls.problem_title.split(' ').slice(0,3).join('%')}%`)
    .limit(1).maybeSingle();

  let pid;
  if (existing) {
    pid = existing.id;
    const { error } = await sb.from('problems').update({ mentions:existing.mentions+1, updated_at:new Date().toISOString() }).eq('id',pid);
    if (error) { process.stdout.write(`[DB err: ${error.message.slice(0,50)}]`); return; }
  } else {
    pid = cls.problem_title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60);
    const { error } = await sb.from('problems').upsert({
      id:pid, title:cls.problem_title, theme:cls.theme, mentions:1,
      trend_pct:0, is_hot:false, ai_brief:cls.excerpt, source_posts:1
    },{ onConflict:'id' });
    if (error) { process.stdout.write(`[DB err: ${error.message.slice(0,50)}]`); return; }
  }
  await sb.from('sources').upsert({
    problem_id:pid, platform:post.platform, subreddit:post.subreddit,
    title:post.title, excerpt:post.excerpt, upvotes:post.upvotes,
    comments_count:post.comments_count, url:post.url,
    posted_at:post.posted_at, raw_id:post.raw_id
  },{ onConflict:'platform,raw_id', ignoreDuplicates:true });
}

async function updateTrends() {
  const w1 = new Date(Date.now()-7*864e5).toISOString();
  const w2 = new Date(Date.now()-14*864e5).toISOString();
  const { data } = await sb.from('problems').select('id');
  for (const { id } of data||[]) {
    const [{ count:a },{ count:b }] = await Promise.all([
      sb.from('sources').select('*',{count:'exact',head:true}).eq('problem_id',id).gte('created_at',w1),
      sb.from('sources').select('*',{count:'exact',head:true}).eq('problem_id',id).gte('created_at',w2).lt('created_at',w1)
    ]);
    await sb.from('problems').update({ trend_pct: b>0?Math.round(((a-b)/b)*100):0 }).eq('id',id);
  }
}

// ════════════════════════════════════════════════════════════════
//  MAIN
// ════════════════════════════════════════════════════════════════
async function main() {
  const t0 = Date.now();
  let total=0, stored=0;

  for (const [theme, cfg] of Object.entries(TOPICS)) {
    process.stdout.write(`\n[${theme}]\n  `);
    const all = [];

    // Reddit
    for (const sub of cfg.reddit) {
      all.push(...await fetchReddit(sub));
      await new Promise(r=>setTimeout(r,1500));
    }
    // HN
    for (const kw of cfg.kw) all.push(...await fetchHN(kw));
    // Dev.to
    all.push(...await fetchDevTo(theme));
    // Twitter
    for (const kw of cfg.kw) {
      all.push(...await fetchTwitter(kw));
      await new Promise(r=>setTimeout(r,3000));
    }
    // Facebook
    for (const kw of cfg.kw) {
      all.push(...await fetchFacebook(kw));
    }

    // Dédupliquer
    const seen = new Set();
    const unique = all.filter(p=>p.raw_id && !seen.has(p.raw_id) && seen.add(p.raw_id));
    total += unique.length;
    process.stdout.write(`${unique.length} posts collectés → analyse IA...\n  `);

    for (const post of unique) {
      const cls = await classify(post);
      if (cls.is_problem && cls.confidence >= 65) {
        await save(post, cls);
        stored++;
        process.stdout.write('✓');
      } else {
        process.stdout.write('·');
      }
    }
    process.stdout.write('\n');
  }

  console.log(`\n\n✅  ${total} posts → ${stored} sauvegardés  (${Math.round((Date.now()-t0)/1000)}s)`);
  console.log('Mise à jour des tendances…');
  await updateTrends();
  console.log('Terminé.');
}

main().catch(err=>{ console.error('❌',err.message); process.exit(1); });
