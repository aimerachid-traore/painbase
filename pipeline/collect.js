// ================================================================
//  collect.js  —  Pipeline Reddit (JSON public) + HN → Groq → Supabase
//
//  Reddit : utilise l'API JSON publique (pas d'inscription requise)
//           https://www.reddit.com/r/{sub}/hot.json
//  HN     : Algolia API (entièrement gratuit)
//  IA     : Groq — llama-3.1-8b-instant (14 400 req/jour gratuit)
//  DB     : Supabase
// ================================================================
import 'dotenv/config';
import Groq from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// ── Vérification credentials ────────────────────────────────────
const HAS_SUPABASE = !!(
  process.env.SUPABASE_URL &&
  process.env.SUPABASE_SERVICE_KEY &&
  !process.env.SUPABASE_URL.includes('xxxx')
);

const HAS_GROQ = !!(
  process.env.GROQ_API_KEY &&
  process.env.GROQ_API_KEY.startsWith('gsk_')
);

if (!HAS_SUPABASE) {
  console.error('❌  SUPABASE_URL ou SUPABASE_SERVICE_KEY manquant.');
  process.exit(1);
}

if (!HAS_GROQ) {
  console.warn('⚠️   GROQ_API_KEY manquante — classification IA désactivée.');
  console.warn('     Obtiens une clé gratuite sur https://console.groq.com');
}

const sb   = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const groq = HAS_GROQ ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

// ── Subreddits à surveiller ─────────────────────────────────────
const SUBREDDITS = {
  'Productivity':     ['productivity','todoist','notion','gettingthingsdone','selfimprovement'],
  'Personal Finance': ['personalfinance','freelance','smallbiz','FIRE','povertyfinance'],
  'Health & Fitness': ['EatCheapAndHealthy','Fitness','loseit','MealPrepSunday','nutrition'],
  'Parenting':        ['NewParents','beyondthebump','daddit','Mommit','Parenting'],
  'Developer Tools':  ['webdev','programming','SaaS','ExperiencedDevs','learnprogramming'],
  'Marketing':        ['marketing','smallbusiness','SEO','Entrepreneur','startups'],
  'Education':        ['college','GetStudying','learnmath','languagelearning','Teachers'],
  'Pets':             ['dogs','cats','puppy101','Pets','DogAdvice']
};

// ── Reddit — JSON public (pas d'API key requise) ────────────────
async function fetchRedditPosts(subreddit, limit = 25) {
  try {
    const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'painbase-research-bot/1.0 (public data aggregation)',
        'Accept': 'application/json'
      }
    });
    if (!res.ok) {
      if (res.status === 429) {
        // Rate limited — attendre 5s et réessayer une fois
        await new Promise(r => setTimeout(r, 5000));
        return fetchRedditPosts(subreddit, limit);
      }
      console.warn(`  Reddit r/${subreddit}: HTTP ${res.status}`);
      return [];
    }
    const data = await res.json();
    return data.data.children
      .map(({ data: p }) => ({
        raw_id:         p.id,
        platform:       'reddit',
        subreddit:      `r/${subreddit}`,
        title:          p.title,
        excerpt:        (p.selftext || '').slice(0, 600),
        upvotes:        p.score,
        comments_count: p.num_comments,
        url:            `https://reddit.com${p.permalink}`,
        posted_at:      new Date(p.created_utc * 1000).toISOString()
      }))
      .filter(p => p.upvotes > 10 && p.title.length > 20); // filtre basique
  } catch (err) {
    console.warn(`  Reddit r/${subreddit}: ${err.message}`);
    return [];
  }
}

// ── HN Algolia (entièrement gratuit, pas d'auth) ────────────────
async function fetchHNPosts(query, limit = 20) {
  try {
    const since = Math.floor(Date.now() / 1000) - 7 * 864e2; // 7 jours
    const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=${limit}&numericFilters=created_at_i>${since}`;
    const res  = await fetch(url);
    const json = await res.json();
    return (json.hits || []).map(h => ({
      raw_id:         String(h.objectID),
      platform:       'hn',
      subreddit:      'Hacker News',
      title:          h.title,
      excerpt:        h.story_text ? h.story_text.replace(/<[^>]+>/g,'').slice(0,600) : '',
      upvotes:        h.points ?? 0,
      comments_count: h.num_comments ?? 0,
      url:            h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
      posted_at:      h.created_at
    }));
  } catch (err) {
    console.warn(`  HN: ${err.message}`);
    return [];
  }
}

// ── Classification Groq ─────────────────────────────────────────
const CLASSIFY_PROMPT = `You are a startup research analyst. Analyze this social media post.
Determine if it describes a REAL, UNSOLVED problem that people would pay to fix.

Post title: {TITLE}
Post content: {CONTENT}
Source: {SOURCE}

Respond ONLY with valid JSON:
{
  "is_problem": true or false,
  "confidence": 0-100,
  "theme": "Productivity|Personal Finance|Health & Fitness|Parenting|Developer Tools|Marketing|Education|Pets|Other",
  "problem_title": "Short clear problem statement, max 12 words",
  "intensity": 1-10,
  "excerpt": "Best 2-3 sentence quote capturing the frustration"
}

is_problem = true ONLY if the post clearly expresses frustration about an unsolved problem.`;

async function classifyPost(post) {
  if (!groq) return { is_problem: false };
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant', // rapide + gratuit (14 400 req/jour)
      max_tokens: 300,
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [{
        role: 'user',
        content: CLASSIFY_PROMPT
          .replace('{TITLE}',   post.title)
          .replace('{CONTENT}', post.excerpt || '(no content)')
          .replace('{SOURCE}',  post.subreddit)
      }]
    });
    return JSON.parse(completion.choices[0].message.content);
  } catch {
    return { is_problem: false };
  }
}

// ── Stockage Supabase ───────────────────────────────────────────
async function storeSource(post, classification) {
  const { data: existing } = await sb
    .from('problems')
    .select('id, mentions')
    .eq('theme', classification.theme)
    .ilike('title', `%${classification.problem_title.split(' ').slice(0,3).join('%')}%`)
    .limit(1)
    .maybeSingle();

  let problemId;

  if (existing) {
    problemId = existing.id;
    await sb.from('problems').update({
      mentions:   existing.mentions + 1,
      updated_at: new Date().toISOString()
    }).eq('id', problemId);
  } else {
    problemId = classification.problem_title
      .toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60);
    await sb.from('problems').upsert({
      id:        problemId,
      title:     classification.problem_title,
      theme:     classification.theme,
      mentions:  1,
      trend_pct: 0,
      is_hot:    false,
      ai_brief:  classification.excerpt,
      source_posts: 1
    }, { onConflict: 'id' });
  }

  await sb.from('sources').upsert({
    problem_id:     problemId,
    platform:       post.platform,
    subreddit:      post.subreddit,
    title:          post.title,
    excerpt:        post.excerpt,
    upvotes:        post.upvotes,
    comments_count: post.comments_count,
    url:            post.url,
    posted_at:      post.posted_at,
    raw_id:         post.raw_id
  }, { onConflict: 'platform,raw_id', ignoreDuplicates: true });

  return problemId;
}

// ── Tendances semaine/semaine ───────────────────────────────────
async function updateTrends() {
  const now   = new Date();
  const w1ago = new Date(now - 7  * 864e5).toISOString();
  const w2ago = new Date(now - 14 * 864e5).toISOString();

  const { data: problems } = await sb.from('problems').select('id');
  if (!problems) return;

  for (const { id } of problems) {
    const [{ count: thisWeek }, { count: lastWeek }] = await Promise.all([
      sb.from('sources').select('*', { count:'exact', head:true })
        .eq('problem_id', id).gte('created_at', w1ago),
      sb.from('sources').select('*', { count:'exact', head:true })
        .eq('problem_id', id).gte('created_at', w2ago).lt('created_at', w1ago)
    ]);
    const trend = lastWeek > 0
      ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : 0;
    await sb.from('problems').update({ trend_pct: trend }).eq('id', id);
  }
}

// ── Main ────────────────────────────────────────────────────────
async function main() {
  console.log(`[${new Date().toISOString()}] PainBase pipeline start`);
  console.log(`  Reddit : JSON public API (pas d'auth requise)`);
  console.log(`  HN     : Algolia API (gratuit)`);
  console.log(`  IA     : ${HAS_GROQ ? 'Groq llama-3.1-8b-instant' : 'Désactivée (GROQ_API_KEY manquante)'}\n`);

  let total = 0, stored = 0;

  for (const [theme, subs] of Object.entries(SUBREDDITS)) {
    console.log(`── ${theme}`);

    // Reddit (JSON public)
    for (const sub of subs) {
      const posts = await fetchRedditPosts(sub);
      total += posts.length;
      for (const post of posts) {
        const cls = await classifyPost(post);
        if (cls.is_problem && cls.confidence >= 70) {
          await storeSource(post, cls);
          stored++;
          process.stdout.write('✓');
        }
      }
      // Respecter le rate limit Reddit : 1 req / 2s
      await new Promise(r => setTimeout(r, 2000));
    }

    // HN
    const hnPosts = await fetchHNPosts(`${theme} frustrated problem`);
    total += hnPosts.length;
    for (const post of hnPosts) {
      const cls = await classifyPost(post);
      if (cls.is_problem && cls.confidence >= 70) {
        await storeSource(post, cls);
        stored++;
        process.stdout.write('✓');
      }
    }
    console.log('');
  }

  console.log(`\nAnalysed ${total} posts → stored ${stored} new problems/sources`);
  console.log('Updating trends…');
  await updateTrends();
  console.log('Done ✓');
}

main().catch(err => { console.error(err); process.exit(1); });
