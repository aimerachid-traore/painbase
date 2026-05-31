// ================================================================
//  seed.js  —  Charge les 12 problèmes statiques dans Supabase
//  Usage : cd pipeline && cp .env.example .env && node seed.js
// ================================================================
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));

// Charge problems-data.js (fichier browser — on l'évalue côté Node)
const dataFile = readFileSync(join(__dir, '../problems-data.js'), 'utf8');
// Isole le tableau PROBLEMS en supprimant les fonctions à la fin
const match = dataFile.match(/const PROBLEMS\s*=\s*(\[[\s\S]*?\]);/);
if (!match) { console.error('PROBLEMS array not found'); process.exit(1); }
const PROBLEMS = new Function('return ' + match[1])();//const PROBLEMS = JSON.parse(match[1]);

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const WEEKS = ['W14','W15','W16','W17','W18','W19','W20','W21','W22','W23','W24','W25'];

async function seed() {
  console.log(`Seeding ${PROBLEMS.length} problems…`);

  for (const p of PROBLEMS) {
    const d = p.detail;

    // 1. Problem
    const { error: pe } = await sb.from('problems').upsert({
      id: p.id, title: p.t, theme: p.theme,
      mentions: p.mentions, trend_pct: p.trend, is_hot: p.hot,
      ai_brief: p.ai, subtitle: d.subtitle, problem_code: d.problemId,
      source_posts: d.sourcePosts, opportunity_score: d.opportunityScore,
      score_demand: d.scores.demand, score_competition: d.scores.competition,
      score_opportunity: d.scores.opportunity,
      verdict: d.verdict, product_angle: d.productAngle
    }, { onConflict: 'id' });
    if (pe) { console.error(`Problem ${p.id}:`, pe.message); continue; }

    // Clean related tables before re-inserting
    await Promise.all([
      sb.from('problem_summaries').delete().eq('problem_id', p.id),
      sb.from('weekly_datapoints').delete().eq('problem_id', p.id),
      sb.from('sources').delete().eq('problem_id', p.id),
      sb.from('competitors').delete().eq('problem_id', p.id),
      sb.from('segments').delete().eq('problem_id', p.id)
    ]);

    // 2. Summaries
    await sb.from('problem_summaries').insert(
      d.aiSummary.map((content, i) => ({ problem_id: p.id, content, position: i }))
    );

    // 3. Weekly datapoints
    await sb.from('weekly_datapoints').insert(
      d.weeklyData.map((mentions, i) => ({
        problem_id: p.id, week_label: WEEKS[i] ?? `W${i}`, position: i, mentions
      }))
    );

    // 4. Sources
    await sb.from('sources').insert(
      d.sources.map(s => ({
        problem_id: p.id, platform: s.platform, subreddit: s.sub,
        title: s.title, excerpt: s.excerpt, upvotes: s.upvotes,
        comments_count: s.comments, url: s.url, posted_at: s.date
      }))
    );

    // 5. Competitors
    await sb.from('competitors').insert(
      d.competitors.map(c => ({
        problem_id: p.id, icon: c.icon, name: c.name,
        description: c.desc, gap_type: c.gap
      }))
    );

    // 6. Segments
    await sb.from('segments').insert(
      d.segments.map((s, i) => ({
        problem_id: p.id, name: s.name, percentage: s.pct, position: i
      }))
    );

    console.log(`  ✓ ${p.id}`);
  }

  console.log('Seed complete.');
}

seed().catch(console.error);
