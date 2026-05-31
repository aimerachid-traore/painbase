const PROBLEMS = [
  {
    id: 'invoice-chasing',
    t: "Freelancers hate chasing late invoices without nagging the client",
    theme: "Personal Finance",
    mentions: 1876, trend: 41, src: ["r/freelance","r/smallbiz"], hot: true,
    ai: "Repeated requests for a polite, automated reminder that won't damage the relationship. Clear willingness to pay.",
    detail: {
      subtitle: "Invoice chasing",
      updated: "2h ago",
      problemId: "PB-00042",
      sourcePosts: 84,
      opportunityScore: 84,
      weeklyData: [720,810,780,895,940,1020,1150,1230,1390,1520,1740,1876],
      scores: { demand: 88, competition: 42, opportunity: 84 },
      verdict: "Strong opportunity — high demand, fragmented supply",
      aiSummary: [
        "Freelancers and independent contractors across Reddit's <strong>r/freelance</strong> (1.2 M members) and <strong>r/smallbiz</strong> consistently report that chasing unpaid invoices is one of the most stressful — and relationship-threatening — parts of running a solo business. The core tension is clear: <strong>they need the money, but they fear damaging the client relationship with too-aggressive follow-ups.</strong>",
        "Current workarounds are manual and fragile: copy-pasted email templates, calendar reminders that get snoozed, or just waiting and hoping. Tools like FreshBooks and Wave offer basic reminders, but users describe them as \"robotic\", \"easy to ignore\", and disconnected from the relational context of the project.",
        "The strongest signal: recurring requests for a reminder that <strong>sounds like it comes from a person, not a billing system</strong> — something that references the project, adjusts tone based on how overdue the invoice is, and knows when to back off after a response."
      ],
      productAngle: "A lightweight invoice-follow-up layer (standalone app or Gmail/Outlook add-on) that drafts context-aware, relationship-safe payment reminders. Charges per sent sequence or SaaS subscription. Willingness to pay is clear — multiple users mention they'd pay $15–30/mo \"without thinking about it.\"",
      segments: [
        { name: "Solo freelancers", pct: 58 },
        { name: "Design agencies", pct: 22 },
        { name: "Dev consultants", pct: 12 },
        { name: "Coaches / advisors", pct: 8 }
      ],
      competitors: [
        { icon: "💸", name: "FreshBooks", desc: "Billing reminders — robotic, template-only", gap: "partial" },
        { icon: "🌊", name: "Wave", desc: "Basic automated emails, no context-awareness", gap: "partial" },
        { icon: "📄", name: "HoneyBook", desc: "Full CRM — overkill for solo operators", gap: "partial" },
        { icon: "🤖", name: "Nothing specific", desc: "Relationship-safe AI follow-up is wide open", gap: "none" }
      ],
      sources: [
        { platform:"reddit", sub:"r/freelance", title:"I'm tired of writing polite emails to late clients. Is there a service that does this for me?", excerpt:"Three months in and I've got $4,400 outstanding. I've sent two follow-ups and they just leave me on read. I don't want to blow up the relationship but I also can't keep doing work for free. FreshBooks sends reminders but they look like generated spam.", upvotes:1847, comments:214, date:"3 days ago", url:"#" },
        { platform:"reddit", sub:"r/smallbiz", title:"How do you handle clients who \"forgot\" to pay for the third time?", excerpt:"I've tried everything — net-15, net-30, 50% upfront. Some clients still treat my invoice like an optional bill. I want something that nudges them automatically without sounding like a collection agency.", upvotes:962, comments:138, date:"1 week ago", url:"#" },
        { platform:"hn", sub:"Hacker News", title:"Ask HN: Tools for freelance invoice follow-up that don't feel aggressive?", excerpt:"I've been manually tracking this in Notion. What I really want is something that looks at how long the invoice has been outstanding, the client's history, and drafts a message that sounds like me — not like a billing bot.", upvotes:341, comments:87, date:"2 weeks ago", url:"#" },
        { platform:"reddit", sub:"r/freelance", title:"Wave and FreshBooks reminders are useless — my clients just ignore them", excerpt:"Tried both. The reminder emails look completely generic, the subject line is literally 'Payment reminder: Invoice #1042'. My client told me he thought it was spam. I need something that sounds human.", upvotes:688, comments:92, date:"2 weeks ago", url:"#" },
        { platform:"reddit", sub:"r/webdev", title:"Built a one-click invoice reminder for myself — anyone else need this?", excerpt:"Sick of writing the same polite email every time, so I made a tiny script that pulls from my invoice API and drafts a custom follow-up via GPT. DMs open if anyone wants to test it.", upvotes:421, comments:63, date:"3 weeks ago", url:"#" }
      ]
    }
  },
  {
    id: 'weekend-recurring-tasks',
    t: "Recurring tasks that should skip weekends still fire on Saturdays",
    theme: "Productivity",
    mentions: 2147, trend: 34, src: ["r/productivity","HN"], hot: true,
    ai: "Users juggle workarounds across 3 apps; none handle weekday-only recurrence natively. Strong demand, weak supply.",
    detail: {
      subtitle: "Weekend task firing",
      updated: "1h ago",
      problemId: "PB-00001",
      sourcePosts: 112,
      opportunityScore: 79,
      weeklyData: [980,1020,1100,1150,1280,1400,1520,1640,1780,1900,2020,2147],
      scores: { demand: 82, competition: 38, opportunity: 79 },
      verdict: "Strong opportunity — core scheduling feature missing across all major apps",
      aiSummary: [
        "Across <strong>r/productivity</strong>, <strong>r/todoist</strong>, and <strong>Hacker News</strong>, the same complaint surfaces repeatedly: task managers treat recurrence as calendar math, ignoring the human reality that most work happens on weekdays. When a \"every Monday\" task fires on a holiday, or a weekly review triggers on Saturday, users scramble through settings menus that don't exist.",
        "The workaround tax is high — users report maintaining three separate systems (calendar, task manager, reminder app) just to get basic weekday-aware scheduling. The frustration is amplified because this is a <strong>solved problem in most calendar apps</strong> but mysteriously absent from task managers.",
        "The highest-signal quote, appearing in multiple forms: <em>\"I've been asking Todoist for weekday-only recurrence for 8 years. At this point I've accepted it will never happen.\"</em>"
      ],
      productAngle: "A lightweight scheduling layer or standalone app that wraps any task manager's API and adds intelligent recurrence rules: skip weekends, skip public holidays, shift to next/prior business day. B2B angle strong — operations teams managing recurring workflows are the loudest segment.",
      segments: [
        { name: "Knowledge workers", pct: 44 },
        { name: "Ops / project managers", pct: 31 },
        { name: "Developers", pct: 16 },
        { name: "Students", pct: 9 }
      ],
      competitors: [
        { icon: "✅", name: "Todoist", desc: "No weekday-only recurrence — 8-year open feature request", gap: "partial" },
        { icon: "📋", name: "Things 3", desc: "Weekend skip available but limited customization", gap: "partial" },
        { icon: "🗒️", name: "TickTick", desc: "Partial support, inconsistent behavior reported", gap: "partial" },
        { icon: "🏗️", name: "Dedicated scheduler", desc: "No standalone weekday-aware task recurrence tool exists", gap: "none" }
      ],
      sources: [
        { platform:"reddit", sub:"r/productivity", title:"Why doesn't ANY task manager support 'skip weekends' for recurring tasks?", excerpt:"I have a daily standup prep task that fires every day including Saturday and Sunday. I just want it to fire Mon-Fri. I've tried Todoist, Things, TickTick — none of them do this properly without creating 5 separate tasks.", upvotes:2341, comments:287, date:"5 days ago", url:"#" },
        { platform:"hn", sub:"Hacker News", title:"The recurring task problem that nobody has solved in 20 years", excerpt:"Every calendar app handles business day logic. Every task manager ignores it completely. There's a $20/mo SaaS sitting here and nobody's building it.", upvotes:891, comments:203, date:"1 week ago", url:"#" },
        { platform:"reddit", sub:"r/todoist", title:"8 years and still no weekday recurrence — switching to a competitor", excerpt:"I've upvoted this feature request since 2016. It has 2,400 upvotes. Todoist just keeps adding AI features while ignoring the basics.", upvotes:1102, comments:156, date:"2 weeks ago", url:"#" },
        { platform:"reddit", sub:"r/productivity", title:"Workaround for weekday-only recurrence in Todoist (it's a mess)", excerpt:"I use a combination of a recurring task + a filter + a manual skip label. It breaks every other week. There has to be a better way.", upvotes:567, comments:89, date:"3 weeks ago", url:"#" },
        { platform:"hn", sub:"Hacker News", title:"Show HN: I built weekday-aware recurrence for Todoist", excerpt:"Fed up with the missing feature, I built a small service that intercepts Todoist webhooks and reschedules tasks that fire on weekends. Happy to open source if there's interest.", upvotes:312, comments:74, date:"1 month ago", url:"#" }
      ]
    }
  },
  {
    id: 'meal-planner-allergies',
    t: "No meal planner respects food allergies AND a tight grocery budget",
    theme: "Health & Fitness",
    mentions: 1604, trend: 22, src: ["r/EatCheapAndHealthy"], hot: false,
    ai: "Existing apps optimise for macros, not constraints. Parents of allergic kids are the loudest segment.",
    detail: {
      subtitle: "Allergy-aware meal planning",
      updated: "4h ago",
      problemId: "PB-00089",
      sourcePosts: 67,
      opportunityScore: 71,
      weeklyData: [880,920,970,1010,1080,1140,1200,1280,1360,1450,1530,1604],
      scores: { demand: 74, competition: 55, opportunity: 71 },
      verdict: "Solid opportunity — emotionally charged niche with loyal retention potential",
      aiSummary: [
        "On <strong>r/EatCheapAndHealthy</strong> and <strong>r/FoodAllergies</strong>, parents of children with multiple food allergies describe a daily planning nightmare: every meal planning app either ignores their constraints entirely or forces them to manually cross-reference each ingredient against a list. The dual constraint of <strong>allergy safety AND budget</strong> is completely unaddressed.",
        "The emotional stakes are unusually high — a mistake isn't just inconvenient, it's a trip to the hospital. This creates strong retention incentives: once a family finds something that works, they don't switch.",
        "Current top tools (Mealime, PlateJoy, Yummly) all optimize for macros or dietary preferences, but none handle the combinatorial complexity of \"nut-free + dairy-free + under $100/week for a family of four\"."
      ],
      productAngle: "A meal planner built around constraint satisfaction: input allergies, budget, and family size — get a weekly plan with a consolidated grocery list. The allergy layer is the defensible moat. Subscription at $8–12/mo, with a family-sharing tier.",
      segments: [
        { name: "Parents of allergic kids", pct: 52 },
        { name: "Adults with multiple allergies", pct: 28 },
        { name: "Budget-conscious families", pct: 14 },
        { name: "Caregivers", pct: 6 }
      ],
      competitors: [
        { icon: "🥗", name: "Mealime", desc: "Dietary preferences only — no true allergy safety", gap: "partial" },
        { icon: "🍽️", name: "PlateJoy", desc: "Personalized but expensive, budget constraints ignored", gap: "partial" },
        { icon: "🛒", name: "Yummly", desc: "Recipe discovery, not constraint-first planning", gap: "partial" },
        { icon: "⚕️", name: "Allergy + budget planner", desc: "Dual-constraint meal planner does not exist", gap: "none" }
      ],
      sources: [
        { platform:"reddit", sub:"r/EatCheapAndHealthy", title:"Is there ANY meal planner that handles nut allergy + dairy-free + under $80/week?", excerpt:"My daughter is anaphylactic to peanuts and tree nuts, and we just found out she's also dairy intolerant. Every app I try either ignores allergies or costs $30/mo. We're on one income.", upvotes:1876, comments:312, date:"4 days ago", url:"#" },
        { platform:"reddit", sub:"r/FoodAllergies", title:"Gave up on all meal planning apps — none handle multiple allergies seriously", excerpt:"It's not just about filtering recipes. I need the app to check every ingredient, flag hidden allergens (\"may contain\"), and still keep me under budget. I've tried 6 apps. None come close.", upvotes:934, comments:178, date:"1 week ago", url:"#" },
        { platform:"reddit", sub:"r/EatCheapAndHealthy", title:"Built a spreadsheet for allergy-safe meal planning — anyone want a copy?", excerpt:"After failing to find an app, I built a Google Sheet that cross-references our allergen list against recipes and calculates weekly cost. It's ugly but it works. 200+ people have asked for it.", upvotes:2103, comments:267, date:"2 weeks ago", url:"#" },
        { platform:"reddit", sub:"r/mealprep", title:"Mealime keeps suggesting recipes with \"may contain nuts\" — dangerous for us", excerpt:"I've reported this three times. Their support says to \"check ingredients manually\". That defeats the entire purpose of a meal planning app for allergy families.", upvotes:445, comments:91, date:"3 weeks ago", url:"#" },
        { platform:"reddit", sub:"r/EatCheapAndHealthy", title:"How do families with food allergies actually meal plan on a budget?", excerpt:"Curious how others manage. We've tried apps, meal kit services, nothing works within our constraints. Currently just rotating 8 safe meals which is getting really old.", upvotes:689, comments:203, date:"1 month ago", url:"#" }
      ]
    }
  },
  {
    id: 'baby-bottle-tracking',
    t: "New parents can't track which bottle the baby refused and why",
    theme: "Parenting",
    mentions: 1389, trend: 55, src: ["r/NewParents","forums"], hot: true,
    ai: "Sleep-deprived users want one-tap logging + pattern detection. Current baby apps feel bloated and slow.",
    detail: {
      subtitle: "Baby feeding tracker",
      updated: "30min ago",
      problemId: "PB-00156",
      sourcePosts: 58,
      opportunityScore: 81,
      weeklyData: [520,580,640,720,800,880,980,1080,1150,1230,1310,1389],
      scores: { demand: 86, competition: 44, opportunity: 81 },
      verdict: "High opportunity — emotionally urgent, current solutions fail on speed",
      aiSummary: [
        "On <strong>r/NewParents</strong>, <strong>r/beyondthebump</strong>, and parenting forums, sleep-deprived parents describe the same scenario: it's 3am, the baby rejected the bottle again, and they can't remember if it was the same nipple flow, the same formula temperature, or the same time of day as last time. <strong>Pattern detection is the missing piece.</strong>",
        "Existing apps like Baby Tracker and Huckleberry are described as \"too many taps\", \"slow to load when you have one hand full\", and \"missing the why behind the refusal\". The core need is one-tap logging that captures context automatically (time of day, last feed gap, bottle type) and surfaces patterns without manual analysis.",
        "The business case is strong: parents in this window (0–12 months) are extremely willing to pay for anything that reduces cognitive load. The app doesn't need to be feature-rich — it needs to be <strong>fast, smart, and forgiving</strong>."
      ],
      productAngle: "A minimalist baby feeding logger with automatic pattern detection. One tap to log a refusal or acceptance, with optional quick-tags (nipple flow, temperature, formula brand). Weekly pattern report: \"Baby refuses bottles between 6–8pm — possible overtiredness window.\" Freemium with $4.99/mo for pattern insights.",
      segments: [
        { name: "New parents (0–6mo)", pct: 61 },
        { name: "Parents (6–12mo)", pct: 24 },
        { name: "Nannies / caregivers", pct: 10 },
        { name: "NICU follow-up", pct: 5 }
      ],
      competitors: [
        { icon: "👶", name: "Baby Tracker", desc: "Full-featured but too slow for 3am one-handed use", gap: "partial" },
        { icon: "🦉", name: "Huckleberry", desc: "Sleep focused, feeding tracking is secondary", gap: "partial" },
        { icon: "📱", name: "Glow Baby", desc: "Comprehensive but overwhelming for new parents", gap: "partial" },
        { icon: "🔍", name: "Pattern detection", desc: "No app connects feeding refusals to contextual patterns", gap: "none" }
      ],
      sources: [
        { platform:"reddit", sub:"r/NewParents", title:"Is there a baby app that actually tells you WHY the bottle was refused?", excerpt:"We've tried 4 apps. They all let you log a refusal but none of them analyze the pattern. I want to know: is it always at 6pm? Always the Tommee Tippee? Always when she's overtired? I'm so exhausted I can't think straight.", upvotes:1654, comments:289, date:"2 days ago", url:"#" },
        { platform:"reddit", sub:"r/beyondthebump", title:"Baby Tracker is too slow when you're holding a screaming baby with one hand", excerpt:"By the time I open the app, navigate to feeding, and add a note, the moment is gone. I just want one button. Log refused. Done. Then tell me what the pattern is at the end of the week.", upvotes:1102, comments:167, date:"5 days ago", url:"#" },
        { platform:"reddit", sub:"r/NewParents", title:"Built a simple Google Form for bottle tracking — the data is actually useful", excerpt:"Just date, time, amount taken, refused y/n, and bottle type. Filter by 'refused' and you can see patterns instantly. Wish an app just did this.", upvotes:876, comments:134, date:"1 week ago", url:"#" },
        { platform:"reddit", sub:"r/daddit", title:"Spent $200 on different bottle brands before tracking helped us find the issue", excerpt:"Turns out our daughter only refuses bottles when she's been awake more than 90 minutes. Nothing to do with the bottle. Wish we'd figured that out earlier.", upvotes:543, comments:98, date:"2 weeks ago", url:"#" },
        { platform:"reddit", sub:"r/NewParents", title:"Huckleberry is great for sleep but their feeding tracking is an afterthought", excerpt:"The sleep predictions are magic but when I asked support about feeding pattern analysis they said 'that's on the roadmap'. It's been on the roadmap for 2 years.", upvotes:412, comments:77, date:"3 weeks ago", url:"#" }
      ]
    }
  },
  {
    id: 'auth-billing-boilerplate',
    t: "Devs rebuild the same auth + billing boilerplate every single project",
    theme: "Developer Tools",
    mentions: 1255, trend: 18, src: ["HN","r/webdev"], hot: false,
    ai: "Boilerplate fatigue is constant. Buyers exist (see ShipFast), but niche stacks remain underserved.",
    detail: {
      subtitle: "Auth & billing boilerplate",
      updated: "3h ago",
      problemId: "PB-00203",
      sourcePosts: 91,
      opportunityScore: 68,
      weeklyData: [760,800,830,880,940,990,1040,1090,1130,1170,1210,1255],
      scores: { demand: 76, competition: 72, opportunity: 68 },
      verdict: "Competitive space — differentiate on stack or developer experience",
      aiSummary: [
        "On <strong>Hacker News</strong> and <strong>r/webdev</strong>, developers consistently report spending 2–4 days on auth and billing setup for every new project — setup that is functionally identical across projects but requires re-integrating Stripe webhooks, session management, and email verification from scratch each time.",
        "The market has responded: ShipFast, Supastarter, and SaaSPegasus exist. But developers on niche stacks (SvelteKit, Remix, Astro, T3) complain that existing starters either target Next.js exclusively or bundle so many opinions that extracting what you need is harder than building from scratch.",
        "<strong>The real gap is not a general boilerplate</strong> — it's stack-specific, opinionated starters with first-class support for the developer's chosen tools. The segment most underserved: Python/FastAPI backends with modern JS frontends."
      ],
      productAngle: "A stack-aware boilerplate generator: select your backend (FastAPI / Go / Node), frontend (SvelteKit / Remix / Astro), and auth provider (Supabase / Clerk / Auth.js) — get a production-ready repo with auth, billing (Stripe), email, and deployment config. One-time purchase or lifetime license at $99–149.",
      segments: [
        { name: "Indie hackers", pct: 48 },
        { name: "Freelancers building MVPs", pct: 27 },
        { name: "Early-stage startups", pct: 18 },
        { name: "Agency developers", pct: 7 }
      ],
      competitors: [
        { icon: "🚀", name: "ShipFast", desc: "Next.js only — dominant in that niche", gap: "partial" },
        { icon: "⭐", name: "Supastarter", desc: "Supabase-specific, limited stack options", gap: "partial" },
        { icon: "🐍", name: "Python starters", desc: "Nothing polished for FastAPI + modern JS frontend", gap: "none" },
        { icon: "🎯", name: "Stack-aware generator", desc: "No tool generates across multiple stack combinations", gap: "none" }
      ],
      sources: [
        { platform:"hn", sub:"Hacker News", title:"I've rebuilt auth and billing 12 times. There has to be a better way.", excerpt:"Each time I start a new project I spend the first 3 days on the same things: auth flows, Stripe webhooks, email verification, forgot password. It's soul-crushing. ShipFast helps but only if you're on Next.js.", upvotes:1876, comments:312, date:"1 week ago", url:"#" },
        { platform:"reddit", sub:"r/webdev", title:"Why is there no ShipFast equivalent for SvelteKit?", excerpt:"I've looked. There are some starter kits but they're all either outdated, missing Stripe, or missing email. For a framework with this much momentum, the boilerplate ecosystem is surprisingly thin.", upvotes:934, comments:178, date:"1 week ago", url:"#" },
        { platform:"hn", sub:"Hacker News", title:"Show HN: I open-sourced my FastAPI + SvelteKit SaaS boilerplate", excerpt:"Tired of rebuilding from scratch. Includes Stripe billing, Supabase auth, email with Resend, and a deployment guide for Railway. 400 stars in 48 hours.", upvotes:1203, comments:267, date:"2 weeks ago", url:"#" },
        { platform:"reddit", sub:"r/SaaS", title:"Spent $150 on a Next.js boilerplate — half the code was unusable for my stack", excerpt:"The auth was tied to Prisma, the billing to a specific Stripe version, the email to a provider I don't use. I ended up with maybe 20% useful code. Would pay more for something actually stack-agnostic.", upvotes:445, comments:91, date:"3 weeks ago", url:"#" },
        { platform:"hn", sub:"Hacker News", title:"The boilerplate market: observations after selling 300 copies of mine", excerpt:"Demand is real and growing. The next opportunity isn't another Next.js starter — it's covering the 40% of developers who use other frameworks and are completely unserved.", upvotes:689, comments:203, date:"1 month ago", url:"#" }
      ]
    }
  },
  {
    id: 'google-review-replies',
    t: "Small shops can't reply to every Google review without sounding robotic",
    theme: "Marketing",
    mentions: 1098, trend: 29, src: ["r/smallbusiness"], hot: false,
    ai: "Owners want on-brand AI replies they can approve in seconds. Reputation anxiety drives urgency.",
    detail: {
      subtitle: "Review reply automation",
      updated: "2h ago",
      problemId: "PB-00318",
      sourcePosts: 44,
      opportunityScore: 76,
      weeklyData: [540,580,620,670,730,790,850,910,970,1020,1060,1098],
      scores: { demand: 79, competition: 48, opportunity: 76 },
      verdict: "Good opportunity — reputation anxiety creates urgency, B2B pricing possible",
      aiSummary: [
        "Small business owners on <strong>r/smallbusiness</strong> and local business forums describe a painful dilemma: Google rewards businesses that reply to every review, but each reply needs to sound authentic and on-brand. Generic \"Thank you for your feedback!\" responses hurt more than help — customers can tell.",
        "Existing tools (Birdeye, Podium, Yext) generate replies but they're designed for enterprise, cost hundreds per month, and produce responses that feel like they were written by a call center.",
        "<strong>The small business sweet spot</strong>: a tool that learns the owner's voice from a few example replies, then generates drafts that sound like the owner wrote them personally. One-click approve, minor edits if needed. The anxiety driver is strong — owners fear that not replying signals they don't care."
      ],
      productAngle: "A review reply co-pilot trained on the business owner's existing replies. Connect Google Business Profile, write 5 sample replies, and the AI matches your tone for every new review. $29/mo per location, with a 3-location agency tier at $59/mo.",
      segments: [
        { name: "Restaurants & cafes", pct: 38 },
        { name: "Local service businesses", pct: 31 },
        { name: "Retail shops", pct: 19 },
        { name: "Health & wellness", pct: 12 }
      ],
      competitors: [
        { icon: "🦅", name: "Birdeye", desc: "Enterprise pricing ($300+/mo) — overkill for SMBs", gap: "partial" },
        { icon: "📞", name: "Podium", desc: "Full customer messaging platform, review replies secondary", gap: "partial" },
        { icon: "⭐", name: "GatherUp", desc: "Review generation focused, reply quality poor", gap: "partial" },
        { icon: "🎨", name: "Voice-matched replies", desc: "No tool learns and replicates the owner's specific tone", gap: "none" }
      ],
      sources: [
        { platform:"reddit", sub:"r/smallbusiness", title:"Is there a tool that writes Google review replies that don't sound like a bot?", excerpt:"I tried three tools. They all produce the exact same generic response. My customers can tell it's not me. I'd rather pay a premium for something that actually sounds like how I talk to people.", upvotes:1234, comments:198, date:"3 days ago", url:"#" },
        { platform:"reddit", sub:"r/restaurantowners", title:"We went from 3.8 to 4.4 stars just by replying to negative reviews — but it's eating my Sundays", excerpt:"Replying to reviews genuinely works. But I have 30 new reviews every week and writing real, thoughtful responses takes 3 hours. I need help scaling this without sounding fake.", upvotes:876, comments:145, date:"1 week ago", url:"#" },
        { platform:"reddit", sub:"r/smallbusiness", title:"Birdeye wants $350/mo for review management — any alternatives?", excerpt:"I run a two-location hair salon. I just want to reply to Google reviews efficiently. $350/mo is more than my marketing budget. There has to be something simpler.", upvotes:654, comments:112, date:"2 weeks ago", url:"#" },
        { platform:"reddit", sub:"r/Entrepreneur", title:"Built a Zapier workflow to auto-draft Google review replies using GPT — sharing the template", excerpt:"It's not perfect but it saves me about 2 hours a week. The key is giving it examples of your past replies so the tone is right. Would love a proper tool that does this out of the box.", upvotes:521, comments:89, date:"3 weeks ago", url:"#" },
        { platform:"reddit", sub:"r/smallbusiness", title:"Negative review strategy: responding quickly matters more than what you say", excerpt:"Data from 200 of our clients shows businesses that reply within 24h get 0.4 more stars on average. The content matters less than the speed. A tool that makes quick replies easy would be gold.", upvotes:445, comments:167, date:"1 month ago", url:"#" }
      ]
    }
  },
  {
    id: 'lecture-notes',
    t: "Students can't turn messy 2-hour lecture recordings into clean notes",
    theme: "Education",
    mentions: 982, trend: 47, src: ["r/college","r/GetStudying"], hot: true,
    ai: "Transcription isn't enough — they want structured, exam-ready summaries. Seasonal spikes around exams.",
    detail: {
      subtitle: "Lecture-to-notes AI",
      updated: "1h ago",
      problemId: "PB-00445",
      sourcePosts: 53,
      opportunityScore: 77,
      weeklyData: [380,420,480,540,600,660,720,780,840,900,940,982],
      scores: { demand: 81, competition: 58, opportunity: 77 },
      verdict: "Good opportunity — strong seasonal demand, students willing to pay during exam crunch",
      aiSummary: [
        "On <strong>r/college</strong> and <strong>r/GetStudying</strong>, students describe a common scenario: they record their 2-hour lecture on their phone \"to review later\", then never actually process it because transcribing and structuring 2 hours of audio is more work than attending again. <strong>The gap isn't transcription — it's transformation.</strong>",
        "Existing tools like Otter.ai and Whisper produce accurate transcripts, but students don't want a transcript — they want <strong>structured, hierarchical notes with key concepts bolded, definitions extracted, and a summary they can review the night before an exam</strong>.",
        "The demand spikes strongly around midterms and finals (2–3× baseline). Students report willingness to pay $10–20/month \"during the semester\" but churn in summer — a challenge for LTV, but also a predictable revenue pattern."
      ],
      productAngle: "An audio-to-structured-notes pipeline: upload lecture recording → get hierarchical notes with key terms, definitions, and a one-page exam summary. Differentiate with course context: tell it \"this is ECON 201\" and the AI structures notes to match the course's typical exam format. $12/mo or $4/recording.",
      segments: [
        { name: "University students", pct: 64 },
        { name: "Graduate students", pct: 18 },
        { name: "Professional learners", pct: 11 },
        { name: "High schoolers", pct: 7 }
      ],
      competitors: [
        { icon: "🦦", name: "Otter.ai", desc: "Great transcription, zero structure or summarization", gap: "partial" },
        { icon: "📝", name: "Notion AI", desc: "Can summarize text but no audio pipeline", gap: "partial" },
        { icon: "🎓", name: "Notta", desc: "Meeting-focused, not student/lecture optimized", gap: "partial" },
        { icon: "📚", name: "Exam-ready notes", desc: "No tool produces course-context-aware structured notes", gap: "none" }
      ],
      sources: [
        { platform:"reddit", sub:"r/college", title:"Is there an app that turns lecture recordings into actual study notes (not just transcripts)?", excerpt:"I have 40 hours of lecture recordings I've never looked at. Otter gives me a wall of text. I want someone to read it and give me bullet points with the important stuff highlighted. Is that too much to ask?", upvotes:2341, comments:398, date:"2 days ago", url:"#" },
        { platform:"reddit", sub:"r/GetStudying", title:"I tried every note-taking AI — here's what actually works for lectures", excerpt:"The ones that just transcribe are useless. The ones that summarize don't know what's important for YOUR class. What I actually want is something that knows the subject matter and structures accordingly.", upvotes:1543, comments:267, date:"1 week ago", url:"#" },
        { platform:"reddit", sub:"r/college", title:"Finals week and I have 12 recordings I never listened to — help", excerpt:"I'm in full panic mode. Is there any way to process these faster than listening to them? Even a decent summary would help at this point.", upvotes:876, comments:201, date:"2 weeks ago", url:"#" },
        { platform:"reddit", sub:"r/productivity", title:"My workflow for turning lecture recordings into Anki flashcards automatically", excerpt:"Record → Whisper → GPT-4 with a prompt that extracts key terms and definitions → Anki import. The whole pipeline takes about 5 minutes per hour of audio. Happy to share the prompt.", upvotes:1102, comments:167, date:"3 weeks ago", url:"#" },
        { platform:"reddit", sub:"r/GetStudying", title:"Otter.ai vs Notta vs Rev for lecture notes — comparison after trying all three", excerpt:"None of them do what I actually need. They're all transcription tools that added a 'summarize' button. The summary is always generic and doesn't capture what the professor emphasized.", upvotes:654, comments:134, date:"1 month ago", url:"#" }
      ]
    }
  },
  {
    id: 'dog-vaccines',
    t: "Dog owners forget which vaccines are due and panic at the vet",
    theme: "Pets",
    mentions: 741, trend: 26, src: ["r/dogs","forums"], hot: false,
    ai: "A simple shared pet-health calendar with reminders. Emotional stakes make this sticky.",
    detail: {
      subtitle: "Pet health calendar",
      updated: "5h ago",
      problemId: "PB-00512",
      sourcePosts: 31,
      opportunityScore: 63,
      weeklyData: [380,400,430,460,500,540,580,620,660,700,720,741],
      scores: { demand: 65, competition: 52, opportunity: 63 },
      verdict: "Moderate opportunity — sticky niche with low CAC potential via vet partnerships",
      aiSummary: [
        "Pet owners across <strong>r/dogs</strong>, <strong>r/cats</strong>, and veterinary forums describe arriving at the vet unable to answer basic questions: \"When was the last rabies booster? Which flea treatment did you use last time?\" Paper vaccine booklets get lost; vet portals don't send reminders.",
        "The emotional layer is significant: owners feel shame and anxiety about not knowing their pet's health history, which makes them highly receptive to a tool that removes this pain.",
        "The distribution angle is underexplored: <strong>vets themselves hate this problem</strong> — it slows down appointments and requires re-doing tests that weren't necessary. A vet-facing version that syncs with the owner app could create a B2B distribution channel with near-zero customer acquisition cost."
      ],
      productAngle: "A shared pet health passport: owners log vaccines, treatments, and vet visits; the app sends reminders before due dates and generates a shareable summary for vet appointments. Free tier per pet, $3/mo for multi-pet households + vet-sync features. B2B vet portal as a growth channel.",
      segments: [
        { name: "Dog owners", pct: 54 },
        { name: "Cat owners", pct: 28 },
        { name: "Multi-pet households", pct: 13 },
        { name: "Pet foster carers", pct: 5 }
      ],
      competitors: [
        { icon: "🐾", name: "PetDesk", desc: "Vet-facing tool, owner experience poor", gap: "partial" },
        { icon: "📱", name: "11pets", desc: "Manual logging only, no vet integration", gap: "partial" },
        { icon: "🏥", name: "VetPort / VetScene", desc: "Practice management, no consumer app", gap: "partial" },
        { icon: "🔗", name: "Vet-synced passport", desc: "No app syncs vet records to owner reminders automatically", gap: "none" }
      ],
      sources: [
        { platform:"reddit", sub:"r/dogs", title:"Is there an app that tracks ALL my dog's health stuff and sends reminders?", excerpt:"Not just vaccines — flea/tick treatment, heartworm, dental cleanings, the works. I have a golden retriever and a beagle and I'm always forgetting something. Paper records are a disaster.", upvotes:1102, comments:189, date:"4 days ago", url:"#" },
        { platform:"reddit", sub:"r/dogs", title:"Vet asked me when my dog's last bordatella was and I had no idea — embarrassing", excerpt:"I have a folder somewhere with his vaccination records. Somewhere. I wish there was just an app where I could see everything at a glance and get a notification before something's due.", upvotes:876, comments:134, date:"1 week ago", url:"#" },
        { platform:"reddit", sub:"r/cats", title:"Lost my cat's vaccine booklet — how do you all track this stuff?", excerpt:"The vet gave me a new printed card but I'm definitely going to lose it again. I've tried reminder apps but they don't have templates for pet vaccines specifically.", upvotes:654, comments:112, date:"2 weeks ago", url:"#" },
        { platform:"reddit", sub:"r/dogs", title:"My vet sends reminder postcards which I throw away — there has to be a better system", excerpt:"I want something digital that connects to my vet's records automatically so I don't have to manually enter anything. Is this too much to ask in 2024?", upvotes:445, comments:87, date:"3 weeks ago", url:"#" },
        { platform:"reddit", sub:"r/Pets", title:"Built a simple Notion template for pet health tracking — sharing it", excerpt:"Tracks vaccines, treatments, weight history, and vet contacts. Formula field calculates next due dates. Not perfect but much better than paper.", upvotes:312, comments:67, date:"1 month ago", url:"#" }
      ]
    }
  },
  {
    id: 'slack-decisions',
    t: "Remote teams lose decisions made in Slack threads forever",
    theme: "Productivity",
    mentions: 903, trend: 31, src: ["HN","r/remotework"], hot: false,
    ai: "Decisions vanish in scrollback. Demand for an AI that captures 'what we decided' automatically.",
    detail: {
      subtitle: "Decision capture for Slack",
      updated: "2h ago",
      problemId: "PB-00089",
      sourcePosts: 47,
      opportunityScore: 73,
      weeklyData: [420,460,500,550,610,660,710,760,810,850,880,903],
      scores: { demand: 77, competition: 46, opportunity: 73 },
      verdict: "Strong opportunity — B2B pricing possible, low-friction Slack integration",
      aiSummary: [
        "Engineering and product teams on <strong>Hacker News</strong> and <strong>r/remotework</strong> describe a universal problem: important decisions get made in Slack threads, then disappear into the scrollback within days. Six months later, nobody can remember why a technical decision was made, which vendor was chosen, or what the agreed approach to a problem was.",
        "The cost is high: teams re-litigate the same decisions, onboard new employees without decision context, and lose institutional knowledge when people leave.",
        "<strong>The core need</strong>: a bot that monitors Slack for decision language (\"we decided\", \"going with\", \"agreed to\", \"final call\") and asks \"Should I save this decision?\" — then logs it to a searchable, tagged decision register."
      ],
      productAngle: "A Slack-native decision capture bot: install, train it on your team's decision vocabulary, and it surfaces decision moments for one-click capture to a searchable register. Integrates with Notion, Confluence, or its own mini-wiki. $15/seat/mo, with team plans from $99/mo.",
      segments: [
        { name: "Engineering teams", pct: 42 },
        { name: "Product teams", pct: 31 },
        { name: "Remote-first companies", pct: 18 },
        { name: "Distributed agencies", pct: 9 }
      ],
      competitors: [
        { icon: "🔍", name: "Slack search", desc: "Exists but hopeless for finding 3-month-old decisions", gap: "partial" },
        { icon: "📔", name: "Notion / Confluence", desc: "Manual — nobody updates docs consistently", gap: "partial" },
        { icon: "🤖", name: "Slab", desc: "Knowledge base, not real-time decision capture", gap: "partial" },
        { icon: "💬", name: "Decision capture bot", desc: "No Slack-native tool auto-detects and captures decisions", gap: "none" }
      ],
      sources: [
        { platform:"hn", sub:"Hacker News", title:"How do you capture decisions made in Slack before they're lost forever?", excerpt:"We made a critical architecture decision in a Slack thread 8 months ago. Now we can't find it and two engineers are arguing about what was decided. We've tried everything — nothing sticks.", upvotes:1876, comments:312, date:"3 days ago", url:"#" },
        { platform:"reddit", sub:"r/remotework", title:"The real cost of remote work: every decision disappears into Slack scrollback", excerpt:"Onboarded a new engineer last month. Spent 3 days answering questions about decisions we made before he joined. All in Slack threads nobody can find. Need a better system.", upvotes:1102, comments:198, date:"1 week ago", url:"#" },
        { platform:"hn", sub:"Hacker News", title:"Show HN: I built a Slack bot that captures decisions to Notion automatically", excerpt:"It watches for phrases like 'we decided' and 'going with X' and asks if you want to log it. 60% capture rate vs 0% with manual docs. Small team use case.", upvotes:934, comments:167, date:"2 weeks ago", url:"#" },
        { platform:"reddit", sub:"r/ExperiencedDevs", title:"Our team's Confluence has 2,000 pages, none of them are up to date", excerpt:"Every decision-logging system we've tried fails because it requires effort to maintain. I want something that captures decisions as they happen, not after the fact.", upvotes:765, comments:134, date:"3 weeks ago", url:"#" },
        { platform:"hn", sub:"Hacker News", title:"Decision registers: the most underrated engineering practice", excerpt:"Every team that does this consistently reports fewer re-litigated decisions and faster onboarding. The problem is getting teams to actually do it. A Slack integration that auto-captures would be game-changing.", upvotes:543, comments:112, date:"1 month ago", url:"#" }
      ]
    }
  },
  {
    id: 'adhd-budgeting',
    t: "People with ADHD can't find a budgeting app that isn't punishing",
    theme: "Personal Finance",
    mentions: 688, trend: 38, src: ["r/ADHD","r/personalfinance"], hot: false,
    ai: "Guilt-based UX backfires. Underserved emotional angle with a vocal, loyal community.",
    detail: {
      subtitle: "ADHD-friendly budgeting",
      updated: "3h ago",
      problemId: "PB-00634",
      sourcePosts: 39,
      opportunityScore: 72,
      weeklyData: [300,330,370,410,450,490,530,570,610,645,668,688],
      scores: { demand: 75, competition: 43, opportunity: 72 },
      verdict: "Strong niche opportunity — vocal community, high emotional loyalty potential",
      aiSummary: [
        "The <strong>r/ADHD</strong> community (2.8M members) has an active thread type: \"budgeting app recommendations that don't make you feel like a failure.\" Existing apps like YNAB and Mint present budgets as a test you're constantly failing — red bars, overspent categories, guilt-trip notifications.",
        "For ADHD users, this punishing UX is actively harmful: shame spirals lead to avoidance, which leads to worse financial outcomes. They need <strong>progress framing, not deficit framing</strong> — celebrating what they got right, not flagging what they got wrong.",
        "The community has articulated the design requirements with unusual clarity: no red colors for overspending, positive reinforcement for any tracking (even late), flexible categories that adapt rather than punish, and friction-free logging (one tap, not five screens)."
      ],
      productAngle: "A budgeting app designed around ADHD cognitive patterns: progress-framed UI (you saved $40 this week!), flexible overspend absorption instead of failure states, Siri/widget quick-add for impulse purchases, and weekly celebrates-not-shame summaries. $6/mo with family plan.",
      segments: [
        { name: "Adults with ADHD", pct: 58 },
        { name: "Undiagnosed but related", pct: 22 },
        { name: "Parents budgeting for ADHD kids", pct: 12 },
        { name: "Anxiety-adjacent users", pct: 8 }
      ],
      competitors: [
        { icon: "💰", name: "YNAB", desc: "Powerful but punishing — high churn in ADHD community", gap: "partial" },
        { icon: "🌿", name: "Monarch Money", desc: "Clean UI but still deficit-framing approach", gap: "partial" },
        { icon: "💚", name: "Copilot", desc: "Apple-only, no ADHD-specific UX considerations", gap: "partial" },
        { icon: "🧠", name: "ADHD-first budgeting", desc: "No app built around ADHD cognitive and emotional patterns", gap: "none" }
      ],
      sources: [
        { platform:"reddit", sub:"r/ADHD", title:"Is there a budgeting app that doesn't make me feel like a complete failure every time I open it?", excerpt:"YNAB is great until I miss a week and everything is red and I feel so ashamed I don't open it for a month. Which makes it worse. I need something that celebrates small wins and doesn't punish gaps.", upvotes:3421, comments:487, date:"2 days ago", url:"#" },
        { platform:"reddit", sub:"r/ADHD_partners", title:"Recommended budgeting apps that work for ADHD brains — megathread", excerpt:"After 200+ comments, the consensus is: nothing exists that was actually designed for us. Everyone is using a cobbled-together system of spreadsheets and habit apps. There's a clear gap here.", upvotes:1876, comments:312, date:"1 week ago", url:"#" },
        { platform:"reddit", sub:"r/personalfinance", title:"Why does every budgeting app shame you for overspending instead of helping you recover?", excerpt:"The red color, the alert, the 'You've overspent in Dining by $47' notification. I already know. Telling me again doesn't help. I need a next step, not a judgment.", upvotes:1543, comments:234, date:"2 weeks ago", url:"#" },
        { platform:"reddit", sub:"r/ADHD", title:"YNAB saved my finances but almost broke my mental health", excerpt:"I went from chaotic spending to actually having savings. But the first 6 months were brutal emotionally. The app has no understanding of shame spirals. A more forgiving version of YNAB would be worth $20/mo to me.", upvotes:1102, comments:189, date:"3 weeks ago", url:"#" },
        { platform:"reddit", sub:"r/ADHD", title:"I track my spending with a basic Notes app because every budgeting app is too punishing", excerpt:"Four lines: groceries, transport, fun, bills. That's it. Works 80% as well as YNAB with 10% of the guilt. Someone please build a real app with this philosophy.", upvotes:876, comments:156, date:"1 month ago", url:"#" }
      ]
    }
  },
  {
    id: 'produce-expiry',
    t: "Home cooks waste produce because nothing tracks what's about to expire",
    theme: "Health & Fitness",
    mentions: 612, trend: 24, src: ["r/MealPrepSunday"], hot: false,
    ai: "Waste guilt + money loss. Camera-based fridge logging is the most-requested feature.",
    detail: {
      subtitle: "Fridge expiry tracker",
      updated: "4h ago",
      problemId: "PB-00721",
      sourcePosts: 28,
      opportunityScore: 64,
      weeklyData: [310,330,360,390,420,450,480,510,545,575,595,612],
      scores: { demand: 68, competition: 57, opportunity: 64 },
      verdict: "Moderate opportunity — camera AI could be the differentiating feature",
      aiSummary: [
        "On <strong>r/MealPrepSunday</strong> and <strong>r/ZeroWaste</strong>, home cooks describe a consistent pattern: buy produce with good intentions, forget about it, find it wilted or moldy a week later. The guilt is both environmental and financial — an average household wastes $1,500/year in food.",
        "The most-requested feature is <strong>camera-based fridge logging</strong>: point your phone at the fridge, the app identifies what's there and when it was bought, and alerts you 2 days before something expires with recipe suggestions that use that ingredient.",
        "The technical challenge (accurate food recognition and shelf-life estimation) has become tractable with modern vision models. The first app to nail the camera-to-reminder pipeline with decent recipe integration could own this niche."
      ],
      productAngle: "A camera-first fridge tracker: photo the contents when you unpack groceries, AI identifies items and estimated shelf life, daily digest shows what to use today. Recipe suggestions prioritized by what's about to expire. Free for one household, $4/mo for multi-person kitchens with shared tracking.",
      segments: [
        { name: "Meal preppers", pct: 41 },
        { name: "Zero-waste conscious", pct: 28 },
        { name: "Budget-focused cooks", pct: 21 },
        { name: "Large households", pct: 10 }
      ],
      competitors: [
        { icon: "🥬", name: "NoWaste", desc: "Manual entry only — most users give up after day 3", gap: "partial" },
        { icon: "🍎", name: "Fridge Pal", desc: "Outdated, poor UX, no AI or camera features", gap: "partial" },
        { icon: "🛒", name: "Instacart / grocery apps", desc: "Track purchases, not expiry or fridge state", gap: "partial" },
        { icon: "📸", name: "Camera fridge AI", desc: "No app reliably identifies fridge contents from a photo", gap: "none" }
      ],
      sources: [
        { platform:"reddit", sub:"r/MealPrepSunday", title:"App that uses your camera to track what's in your fridge — does this exist?", excerpt:"I want to take a photo of my fridge on Sunday and have the app tell me what to cook Thursday based on what's about to expire. This seems buildable with current AI. Why doesn't it exist?", upvotes:2341, comments:356, date:"4 days ago", url:"#" },
        { platform:"reddit", sub:"r/ZeroWaste", title:"I wasted $67 in produce last month — tracking apps don't work for me", excerpt:"The manual entry is the problem. I'm not going to log every item. But I'd definitely take a photo. Camera-first is the only way this works for real people.", upvotes:1102, comments:198, date:"1 week ago", url:"#" },
        { platform:"reddit", sub:"r/MealPrepSunday", title:"The \"use it up\" problem: how do you avoid wasting the last bits of produce?", excerpt:"I end up with half a cabbage, 3 mushrooms, and some wilting cilantro every week. I know there are recipes that use exactly this combination but I can never think of them when I'm standing in front of the fridge.", upvotes:876, comments:156, date:"2 weeks ago", url:"#" },
        { platform:"reddit", sub:"r/frugal", title:"Calculated my annual food waste — it's $1,400. Looking for a solution.", excerpt:"I know what to buy. I just forget to use it before it goes bad. An app that bothers me 2 days before something expires would actually change my behavior.", upvotes:654, comments:134, date:"3 weeks ago", url:"#" },
        { platform:"reddit", sub:"r/MealPrepSunday", title:"Built a Notion template for fridge tracking — it actually works", excerpt:"Weekly table: item, bought date, estimated expiry, used checkbox. The act of filling it in makes you think about what you have. Not for everyone but dropped my waste by ~60%.", upvotes:445, comments:89, date:"1 month ago", url:"#" }
      ]
    }
  },
  {
    id: 'marketing-attribution',
    t: "Indie devs can't tell which marketing channel actually drove a signup",
    theme: "Marketing",
    mentions: 574, trend: 33, src: ["HN","r/SaaS"], hot: false,
    ai: "Attribution is opaque and enterprise tools overkill. A lightweight, dev-friendly tracker is wanted.",
    detail: {
      subtitle: "Lightweight attribution for indie devs",
      updated: "2h ago",
      problemId: "PB-00834",
      sourcePosts: 36,
      opportunityScore: 70,
      weeklyData: [240,265,295,325,360,395,430,465,500,530,554,574],
      scores: { demand: 73, competition: 61, opportunity: 70 },
      verdict: "Good opportunity — developer audience, self-serve, low CAC via HN/Product Hunt",
      aiSummary: [
        "Indie developers and bootstrapped SaaS founders on <strong>Hacker News</strong> and <strong>r/SaaS</strong> describe spending money across Twitter, Reddit, newsletters, and SEO without any reliable way to know which channel is producing signups. GA4 is described as \"broken for this use case\", Segment is enterprise-priced, and UTM parameters decay before they help.",
        "The specific pain: indie devs run 3–5 marketing experiments simultaneously with small budgets ($50–200/channel). Knowing that one channel produced 80% of signups would let them double down — but without attribution, they spread budget equally across channels that may be dead.",
        "<strong>The dev-friendly angle is the moat</strong>: a tool that installs in 2 lines of code, gives a simple dashboard (\"channel → signups → LTV\"), and doesn't require a marketing team to interpret."
      ],
      productAngle: "A developer-first attribution tool: one script tag, automatic UTM capture, first-touch and last-touch attribution, Stripe revenue linking. Simple dashboard, no data warehouse required. $19/mo for indie tier (up to 10k events), $49/mo for growth. Developer-centric pricing and docs.",
      segments: [
        { name: "Indie SaaS founders", pct: 52 },
        { name: "Bootstrapped startups", pct: 28 },
        { name: "Developer tools companies", pct: 13 },
        { name: "Freelancers with products", pct: 7 }
      ],
      competitors: [
        { icon: "📊", name: "Google Analytics 4", desc: "Privacy-broken, complex, not built for conversions", gap: "partial" },
        { icon: "🔗", name: "Segment", desc: "Enterprise pricing and complexity — $120/mo minimum", gap: "partial" },
        { icon: "🎯", name: "Fathom / Plausible", desc: "Privacy-first analytics but no attribution or revenue linking", gap: "partial" },
        { icon: "👨‍💻", name: "Indie attribution", desc: "No simple, dev-first tool linking channel → signup → revenue", gap: "none" }
      ],
      sources: [
        { platform:"hn", sub:"Hacker News", title:"How do you do marketing attribution as an indie dev without losing your mind?", excerpt:"I'm spending ~$400/mo across 4 channels. I have literally no idea which one is working. GA4 is a mess, UTMs don't persist, and I don't have time to set up Segment. Just want to know: this channel → this signup.", upvotes:1876, comments:267, date:"3 days ago", url:"#" },
        { platform:"reddit", sub:"r/SaaS", title:"Spent $2k on marketing before realizing Twitter was driving 90% of my signups", excerpt:"I was splitting budget evenly across Twitter, Reddit, newsletter, and cold email. It was Twitter the whole time. I would have known this in week 1 with proper attribution. What tools do you use?", upvotes:1234, comments:189, date:"1 week ago", url:"#" },
        { platform:"hn", sub:"Hacker News", title:"Show HN: Lightweight attribution for indie SaaS — 2-line install", excerpt:"Just UTM capture → signup linking → Stripe revenue. No data warehouse, no complex setup. Built this for myself after failing to get useful data from GA4.", upvotes:876, comments:145, date:"2 weeks ago", url:"#" },
        { platform:"reddit", sub:"r/SaaS", title:"GA4 is completely broken for SaaS attribution — alternatives?", excerpt:"I've spent 20 hours trying to set up proper conversion tracking in GA4. The data makes no sense. There has to be a simpler tool for someone who just wants to know which marketing channel drives paid signups.", upvotes:654, comments:112, date:"3 weeks ago", url:"#" },
        { platform:"hn", sub:"Hacker News", title:"The indie hacker attribution problem: why is this still unsolved?", excerpt:"Most indie devs fly blind on marketing. The tools that exist are either broken (GA4), complex (Segment), or incomplete (Plausible). A simple Stripe-linked attribution dashboard would be worth $50/mo easily.", upvotes:543, comments:98, date:"1 month ago", url:"#" }
      ]
    }
  }
];

// lookup by id
function getProblemById(id) {
  return PROBLEMS.find(p => p.id === id) || null;
}

// related problems (same theme, excluding current)
function getRelatedProblems(id, limit) {
  const current = getProblemById(id);
  if (!current) return [];
  return PROBLEMS
    .filter(p => p.id !== id && p.theme === current.theme)
    .slice(0, limit || 3);
}
