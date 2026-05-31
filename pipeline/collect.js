// ================================================================
//  collect.js  —  Pipeline Reddit + HN → Claude → Supabase
//  Lancé par GitHub Actions toutes les 6h (voir .github/workflows/pipeline.yml)
//
//  Flow :
//   1. Cherche les posts Reddit/HN avec des mots-clés "pain point"
//   2. Envoie chaque post à Claude pour classification
//   3. Si c'est un vrai problème non résolu → l'insère dans Supabase
//   4. Met à jour le compte de mentions + tendances
// ================================================================
import 'dotenv/config';
import Snoowrap from 'snoowrap';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const sb  = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const ai  = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const reddit = new Snoowrap({
  userAgent: 'painbase-collector/1.0',
  clientId:     process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  username:     process.env.REDDIT_USERNAME,
  password:     process.env.REDDIT_PASSWORD
});

// Subreddits à surveiller par thème
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

// ── Étape 1 : Fetch Reddit ─────────────────────────────────────
async function fetchRedditPosts(subreddit, limit = 25) {
  try {
    const posts = await reddit.getSubreddit(subreddit)
      .getHot({ limit })
      .then(listing => listing.map(post => ({
        raw_id: post.id,
        platform: 'reddit',
        subreddit: `r/${subreddit}`,
        title: post.title,
        excerpt: (post.selftext || '').slice(0, 600),
        upvotes: post.score,
        comments_count: post.num_comments,
        url: `https://reddit.com${post.permalink}`,
        posted_at: new Date(post.created_utc * 1000).toISOString()
      })));
    return posts;
  } catch (err) {
    console.warn(`Reddit ${subreddit}:`, err.message);
    return [];
  }
}

// ── Étape 2 : Fetch HN (Algolia, gratuit, pas d'auth) ──────────
async function fetchHNPosts(query, limit = 20) {
  try {
    const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=${limit}&numericFilters=created_at_i>${Math.floor(Date.now()/1000)-604800}`; // dernière semaine
    const res  = await fetch(url);
    const json = await res.json();
    return json.hits.map(h => ({
      raw_id: String(h.objectID),
      platform: 'hn',
      subreddit: 'Hacker News',
      title: h.title,
      excerpt: h.story_text ? h.story_text.replace(/<[^>]+>/g,'').slice(0,600) : '',
      upvotes: h.points ?? 0,
      comments_count: h.num_comments ?? 0,
      url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
      posted_at: h.created_at
    }));
  } catch (err) {
    console.warn('HN fetch:', err.message);
    return [];
  }
}

// ── Étape 3 : Classifier avec Claude ──────────────────────────
const CLASSIFY_PROMPT = `You are a startup research analyst. Analyze this social media post and determine if it describes a real, unsolved problem that people would pay to fix.

Post title: {TITLE}
Post content: {CONTENT}
Source: {SOURCE}

Respond with ONLY valid JSON (no markdown):
{
  "is_problem": true/false,
  "confidence": 0-100,
  "theme": "Productivity|Personal Finance|Health & Fitness|Parenting|Developer Tools|Marketing|Education|Pets|Other",
  "problem_title": "Short, clear problem statement (max 12 words)",
  "intensity": 1-10,
  "excerpt": "Best 2-3 sentence quote from the post that captures the frustration"
}

is_problem = true ONLY if: the post clearly describes frustration with an unsolved problem, not just a question or general discussion.`;

async function classifyPost(post) {
  try {
    const prompt = CLASSIFY_PROMPT
      .replace('{TITLE}',   post.title)
      .replace('{CONTENT}', post.excerpt || '(no content)')
      .replace('{SOURCE}',  post.subreddit);

    const msg = await ai.messages.create({
      model: 'claude-haiku-4-5',  // rapide + bon marché pour la classification
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }]
    });

    return JSON.parse(msg.content[0].text);
  } catch {
    return { is_problem: false };
  }
}

// ── Étape 4 : Upsert dans Supabase ────────────────────────────
async function storeSource(post, classification) {
  // Cherche un problème existant proche (même thème + titre similaire)
  const { data: existing } = await sb
    .from('problems')
    .select('id, mentions')
    .eq('theme', classification.theme)
    .textSearch('title', classification.problem_title.split(' ').slice(0,3).join(' '))
    .limit(1)
    .single();

  let problemId;

  if (existing) {
    // Incrémente les mentions
    problemId = existing.id;
    await sb.from('problems').update({
      mentions: existing.mentions + 1,
      updated_at: new Date().toISOString()
    }).eq('id', problemId);
  } else {
    // Crée un nouveau problème (sans analyse IA complète pour l'instant)
    problemId = classification.problem_title
      .toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60);

    await sb.from('problems').upsert({
      id: problemId,
      title: classification.problem_title,
      theme: classification.theme,
      mentions: 1,
      trend_pct: 0,
      is_hot: false,
      ai_brief: classification.excerpt,
      source_posts: 1
    }, { onConflict: 'id' });
  }

  // Insère la source (ignore si déjà présente via l'index unique)
  await sb.from('sources').upsert({
    problem_id: problemId,
    platform: post.platform,
    subreddit: post.subreddit,
    title: post.title,
    excerpt: post.excerpt,
    upvotes: post.upvotes,
    comments_count: post.comments_count,
    url: post.url,
    posted_at: post.posted_at,
    raw_id: post.raw_id
  }, { onConflict: 'platform,raw_id', ignoreDuplicates: true });

  return problemId;
}

// ── Étape 5 : Recalcule le trend semaine sur semaine ──────────
async function updateTrends() {
  // Compte les mentions des 7 derniers jours vs 7 jours précédents
  const now   = new Date();
  const w1ago = new Date(now - 7  * 864e5).toISOString();
  const w2ago = new Date(now - 14 * 864e5).toISOString();

  const { data: problems } = await sb.from('problems').select('id');
  if (!problems) return;

  for (const { id } of problems) {
    const [{ count: thisWeek }, { count: lastWeek }] = await Promise.all([
      sb.from('sources').select('*', { count: 'exact', head: true })
        .eq('problem_id', id).gte('created_at', w1ago),
      sb.from('sources').select('*', { count: 'exact', head: true })
        .eq('problem_id', id).gte('created_at', w2ago).lt('created_at', w1ago)
    ]);

    const trend = lastWeek > 0
      ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100)
      : 0;

    await sb.from('problems').update({ trend_pct: trend }).eq('id', id);
  }
}

// ── Main ───────────────────────────────────────────────────────
async function main() {
  console.log(`[${new Date().toISOString()}] Pipeline start`);
  let total = 0, stored = 0;

  for (const [theme, subs] of Object.entries(SUBREDDITS)) {
    console.log(`\n── ${theme}`);

    // Reddit
    for (const sub of subs) {
      const posts = await fetchRedditPosts(sub);
      total += posts.length;
      for (const post of posts) {
        const cls = await classifyPost(post);
        if (cls.is_problem && cls.confidence >= 70) {
          await storeSource(post, cls);
          stored++;
          process.stdout.write('.');
        }
      }
      await new Promise(r => setTimeout(r, 1000)); // rate limit Reddit
    }

    // HN
    const hnPosts = await fetchHNPosts(`${theme} problem frustrated`);
    total += hnPosts.length;
    for (const post of hnPosts) {
      const cls = await classifyPost(post);
      if (cls.is_problem && cls.confidence >= 70) {
        await storeSource(post, cls);
        stored++;
        process.stdout.write('.');
      }
    }
  }

  console.log(`\n\nAnalysed ${total} posts → stored ${stored} problems/sources`);
  console.log('Updating trends…');
  await updateTrends();
  console.log('Done.');
}

main().catch(err => { console.error(err); process.exit(1); });
