# PainBase

**The database of real problems worth solving.**

PainBase mines Reddit, Hacker News & forums for the things people actually complain about — then clusters them into validated, fundable problems. Stop guessing what to build.

🌐 **Live site**: [painbase.pages.dev](https://painbase.pages.dev/painbase-landing)

---

## What it does

- Automatically scrapes Reddit (20+ themes), Hacker News and Dev.to every 4 hours
- Classifies posts with Groq AI (llama-3.1-8b-instant) to detect real unresolved pain points
- Stores validated problems in Supabase with mention counts, trend data, and AI analysis
- On-demand search: type any keyword → scrapes Reddit & HN live → returns SaaS ideas in seconds
- New searched topics are automatically saved to the database for future visitors

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Vanilla HTML/CSS/JS |
| Backend | Cloudflare Pages Functions (serverless) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| AI | Groq API (llama-3.1-8b-instant) |
| Hosting | Cloudflare Pages (free, unlimited bandwidth) |
| Pipeline | Node.js (GitHub Actions, every 4h) |

---

## Project structure

```
painbase/
├── painbase-landing.html     # Main page — problem explorer
├── painbase-detail.html      # Problem detail page
├── painbase-dashboard.html   # User saved problems
├── painbase-pricing.html     # Pricing (free)
├── auth-ui.js / auth-ui.css  # Auth modal
├── supabase-client.js        # Supabase SDK wrapper
├── supabase.config.js        # Supabase public config
├── functions/
│   └── search.js             # Cloudflare Pages Function (live search)
├── pipeline/
│   ├── collect.js            # Data collection pipeline
│   ├── seed.js               # Load demo data
│   ├── schema.sql            # Database schema
│   └── schema_events.sql     # Analytics events table
└── .github/workflows/
    └── collect.yml           # GitHub Actions — runs every 4h
```

---

## Setup

### 1. Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Run `pipeline/schema.sql` in the SQL Editor
3. Run `pipeline/schema_events.sql` in the SQL Editor
4. Copy your `Project URL` and `anon key` into `supabase.config.js`

### 2. Pipeline (local)

```bash
cd pipeline
cp .env.example .env   # fill in your keys
npm install
node seed.js           # load demo data (optional)
node collect.js        # run the collector
```

Required env vars in `pipeline/.env`:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
GROQ_API_KEY=gsk_...
APIFY_TOKEN=apify_api_...   (optional — for Facebook)
```

### 3. GitHub Actions (automated pipeline)

Add these secrets in **GitHub → Settings → Secrets → Actions**:

| Secret | Description |
|--------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | service_role key (not anon) |
| `GROQ_API_KEY` | Groq API key |
| `APIFY_TOKEN` | Apify token (optional) |

The pipeline runs automatically every 4 hours. Trigger manually via **Actions → Run workflow**.

### 4. Cloudflare Pages

1. Connect repo to Cloudflare Pages (Workers & Pages → Create → Pages)
2. Build command: *(empty)*
3. Output directory: `.`
4. Add these **Environment variables** (Settings → Environment variables):

| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | For live on-demand search |
| `SUPABASE_URL` | For saving search results |
| `SUPABASE_SERVICE_KEY` | service_role key |

---

## Data sources

| Source | Method | Key required |
|--------|--------|--------------|
| Reddit | Public JSON API | No |
| Hacker News | Algolia API | No |
| Dev.to | Public API | No |
| Twitter/X | Nitter RSS | No |
| Facebook | Apify scraper | Yes (free tier) |

---

## Themes covered (20)

Productivity · Personal Finance · Health & Fitness · Parenting · Developer Tools · Marketing · Education · Pets · Gaming · Travel · Remote Work · E-commerce · Mental Health · Real Estate · Recruiting & HR · Social Media · Finance & Investing · Food & Restaurant · Home & DIY · Legal & Compliance

---

## Analytics

Run `analytics.local.html` locally (not in repo) to view:
- Registered users, saves, problems over time
- Most popular topics and searches
- Theme distribution, source breakdown
- Real-time events from Supabase

---

## License

MIT
