import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Al-MOG.io — Product Proposal & Roadmap',
  description: 'Political Influencer Finder: concept, usage scenarios, wireframes, and phased delivery plan',
};

// ─── data ───────────────────────────────────────────────────────────────────

const SCENARIOS = [
  {
    persona: 'Senate Candidate',
    icon: '🏛️',
    name: 'Alex Rivera',
    context: 'Running for U.S. Senate in Ohio, focused on healthcare & economy',
    need: '"I need to quickly identify which local Instagram and YouTube creators already talk to my voters — I can\'t afford to cold-pitch the wrong people."',
    flow: [
      'Sets keywords: "healthcare reform", "Ohio economy"',
      'Filters: Ohio location, 50K–2M followers, 3%+ engagement',
      'Selects Instagram + YouTube',
      'AI returns 10 ranked profiles with relevance scores',
      'Contacts top 3 for paid partnership',
    ],
    outcome: 'Saves 40+ hours of manual research per campaign cycle',
    color: 'from-blue-500/20 to-blue-600/10',
    border: 'border-blue-500/30',
  },
  {
    persona: 'Campaign Manager',
    icon: '📋',
    name: 'Dana Okafor',
    context: 'Managing 3 simultaneous state-level campaigns across TX, FL, GA',
    need: `"I need a bird's-eye view — which influencers overlap across my campaigns, who's exclusive, and where are my coverage gaps."`,
    flow: [
      'Runs separate searches per state with shared topic tags',
      'Compares results across campaigns side-by-side',
      'Exports CSV of top influencers per region',
      'Tracks outreach status per influencer',
      'Re-runs search monthly to catch new voices',
    ],
    outcome: 'Manages influencer strategy for 3 campaigns from a single tool',
    color: 'from-emerald-500/20 to-emerald-600/10',
    border: 'border-emerald-500/30',
  },
  {
    persona: 'Political PAC Director',
    icon: '🌐',
    name: 'Marcus Chen',
    context: 'Running national issue-advocacy PAC focused on climate policy',
    need: '"We need TikTok and Twitter voices with massive reach who genuinely care about climate — not just any influencer who\'ll take our money."',
    flow: [
      'Sets keywords: "climate change", "green energy", "carbon tax"',
      'Selects all platforms, no location filter',
      'Sets min 200K followers, min 5% engagement',
      'AI scores content alignment to policy positions',
      'Builds outreach list of 50+ qualified creators',
    ],
    outcome: 'Narrows 50,000 potential creators down to 50 qualified targets',
    color: 'from-teal-500/20 to-teal-600/10',
    border: 'border-teal-500/30',
  },
  {
    persona: 'Political PR Firm',
    icon: '💼',
    name: 'Sterling & Associates',
    context: 'Agency advising 12 political clients across 6 states',
    need: '"Our clients pay us for data-driven recommendations. We need to prove our influencer picks with scores and AI reasoning — not gut feel."',
    flow: [
      'Creates branded search profiles per client',
      'Generates PDF/CSV reports with AI summaries',
      'Presents ranked influencer shortlist in client meetings',
      'Tracks which influencers are "in use" by other clients',
      'Monitors engagement trends over time',
    ],
    outcome: 'Delivers professional influencer intelligence reports at scale',
    color: 'from-purple-500/20 to-purple-600/10',
    border: 'border-purple-500/30',
  },
];

const PHASES = [
  {
    id: 'poc',
    label: 'POC',
    title: 'Proof of Concept',
    subtitle: 'COMPLETED ✓',
    timeline: 'Delivered',
    color: 'emerald',
    borderColor: 'border-emerald-500',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    dotColor: 'bg-emerald-500',
    deliverables: [
      'Next.js 14 full-stack app scaffolded',
      'AI agent: Groq + Llama 3.3 70B (free)',
      'Search form with all 5 platforms',
      'Mock influencer data generator',
      'Ranked results grid with AI scores',
      'Influencer detail modal with AI summary',
      'Free / PRO tier gating logic',
      'YouTube & Twitter API stubs',
    ],
    metrics: ['5 platforms', '10 results (free)', 'AI scoring 0-100', 'Build: ✓'],
  },
  {
    id: 'mil1',
    label: 'M1',
    title: 'Milestone 1',
    subtitle: 'Real Data & Auth',
    timeline: '~4 weeks',
    color: 'yellow',
    borderColor: 'border-yellow-500',
    badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    dotColor: 'bg-yellow-500',
    deliverables: [
      'Live YouTube Data API v3 integration',
      'Live Twitter/X API v2 integration',
      'User accounts (email + OAuth)',
      'Saved searches & search history',
      'Influencer bookmarks / shortlists',
      'Improved AI prompt with real data signals',
      'CSV + PDF export (PRO)',
      'Mobile-responsive UI polish',
    ],
    metrics: ['Real API data', 'User auth', 'Save & export', 'Search history'],
  },
  {
    id: 'mil2',
    label: 'M2',
    title: 'Milestone 2',
    subtitle: 'Campaign Management',
    timeline: '~6 weeks',
    color: 'orange',
    borderColor: 'border-orange-500',
    badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    dotColor: 'bg-orange-500',
    deliverables: [
      'Campaign workspace (multi-project dashboard)',
      'Side-by-side influencer comparison tool',
      'Outreach status tracker (contacted / replied / signed)',
      'Instagram Graph API integration',
      'TikTok Research API integration',
      'Influencer overlap detection across campaigns',
      'Team collaboration (share campaigns)',
      'Scheduled re-search alerts (new influencers)',
    ],
    metrics: ['Campaign workspaces', 'Outreach CRM', '5 live APIs', 'Team sharing'],
  },
  {
    id: 'mil3',
    label: 'M3',
    title: 'Milestone 3',
    subtitle: 'Intelligence Platform',
    timeline: '~8 weeks',
    color: 'red',
    borderColor: 'border-red-500',
    badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
    dotColor: 'bg-red-400',
    deliverables: [
      'Longitudinal analytics dashboard (trend over time)',
      'Audience sentiment analysis per influencer',
      'White-label mode for agencies',
      'Public REST API for enterprise integrations',
      'CRM integrations (HubSpot, Salesforce)',
      'AI-generated campaign briefing documents',
      'Fraud / bot detection scoring',
      'Billing & subscription management',
    ],
    metrics: ['Analytics platform', 'White-label', 'Public API', 'Enterprise CRM'],
  },
];

// ─── wireframe components (pure CSS sketches) ───────────────────────────────

function WireSearchForm() {
  return (
    <div className="bg-[#0a1628] border border-slate-600/40 rounded-xl p-4 text-[10px] font-mono w-64 shrink-0">
      <div className="text-slate-500 mb-3 text-[9px] uppercase tracking-widest">Search Panel</div>
      {/* keyword */}
      <div className="mb-2">
        <div className="h-2 w-24 bg-slate-600/60 rounded mb-1" />
        <div className="h-7 bg-slate-800 border border-slate-600/50 rounded flex items-center px-2">
          <div className="h-2 w-20 bg-slate-600/40 rounded" />
        </div>
        <div className="flex gap-1 mt-1 flex-wrap">
          {['healthcare', 'economy'].map((k) => (
            <span key={k} className="px-1.5 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-500/70 text-[8px]">{k} ✕</span>
          ))}
        </div>
      </div>
      {/* location */}
      <div className="mb-2">
        <div className="h-2 w-16 bg-slate-600/60 rounded mb-1" />
        <div className="h-7 bg-slate-800 border border-slate-600/50 rounded flex items-center px-2">
          <div className="h-2 w-24 bg-slate-600/40 rounded" />
        </div>
      </div>
      {/* platforms */}
      <div className="mb-2">
        <div className="h-2 w-14 bg-slate-600/60 rounded mb-1.5" />
        {['📸 Instagram', '🐦 X / Twitter', '▶️ YouTube', '🎵 TikTok', '👥 Facebook'].map((p) => (
          <div key={p} className="flex items-center gap-1.5 mb-1">
            <div className="w-3 h-3 bg-yellow-500/60 rounded-sm border border-yellow-500/40 flex items-center justify-center text-[6px] text-black font-bold">✓</div>
            <span className="text-slate-400 text-[9px]">{p}</span>
          </div>
        ))}
      </div>
      {/* slider */}
      <div className="mb-3">
        <div className="h-2 w-28 bg-slate-600/60 rounded mb-1.5" />
        <div className="relative h-1.5 bg-slate-700 rounded-full">
          <div className="absolute left-1/4 right-1/3 h-full bg-yellow-500/60 rounded-full" />
          <div className="absolute left-1/4 -top-0.5 w-2.5 h-2.5 bg-yellow-400 rounded-full border border-slate-900" />
          <div className="absolute right-1/3 -top-0.5 w-2.5 h-2.5 bg-yellow-400 rounded-full border border-slate-900" />
        </div>
      </div>
      {/* button */}
      <div className="h-8 bg-gradient-to-r from-yellow-500/80 to-amber-500/80 rounded-lg flex items-center justify-center text-[9px] font-bold text-black">
        🔍 Find Influencers
      </div>
    </div>
  );
}

function WireResultCard({ score, name, platform, rank }: { score: number; name: string; platform: string; rank: number }) {
  return (
    <div className="bg-[#0f1b2d] border border-slate-700/50 rounded-lg p-3 text-[9px] font-mono">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 bg-slate-700 rounded-full flex items-center justify-center text-[8px] text-slate-300">{rank}</div>
        <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center text-sm">{platform}</div>
        <div className="flex-1">
          <div className="h-2 w-20 bg-slate-500/60 rounded mb-1" />
          <div className="h-1.5 w-14 bg-slate-600/40 rounded" />
        </div>
        <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-[9px] font-bold"
          style={{ borderColor: score >= 80 ? '#34d399' : '#fbbf24', color: score >= 80 ? '#34d399' : '#fbbf24' }}>
          {score}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1 mt-2">
        {['Followers', 'Engage', 'Score'].map((l) => (
          <div key={l} className="bg-slate-800/60 rounded p-1 text-center">
            <div className="h-2 w-8 bg-slate-500/50 rounded mx-auto mb-0.5" />
            <div className="text-slate-500 text-[7px]">{l}</div>
          </div>
        ))}
      </div>
      <div className="mt-2 h-5 bg-slate-800/40 rounded border border-slate-700/30 flex items-center px-2">
        <div className="h-1.5 w-32 bg-slate-600/30 rounded" />
      </div>
    </div>
  );
}

function WireResults() {
  return (
    <div className="bg-[#0a1628] border border-slate-600/40 rounded-xl p-4 text-[10px] font-mono flex-1 min-w-0">
      <div className="text-slate-500 mb-3 text-[9px] uppercase tracking-widest">Results Panel</div>
      {/* header bar */}
      <div className="flex items-center gap-2 mb-3">
        <div>
          <div className="h-2.5 w-32 bg-slate-500/60 rounded mb-1" />
          <div className="h-2 w-44 bg-slate-600/40 rounded" />
        </div>
        <div className="ml-auto flex gap-2">
          <div className="h-6 w-20 bg-slate-800 border border-slate-700 rounded" />
          <div className="h-6 w-16 bg-yellow-500/10 border border-yellow-500/20 rounded" />
        </div>
      </div>
      {/* summary stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {['Total Reach', 'Avg Score', 'Avg Engagement'].map((l) => (
          <div key={l} className="bg-slate-800/40 border border-slate-700/40 rounded-lg p-2 text-center">
            <div className="h-3 w-10 bg-slate-500/60 rounded mx-auto mb-1" />
            <div className="text-slate-500 text-[7px] uppercase">{l}</div>
          </div>
        ))}
      </div>
      {/* cards */}
      <div className="space-y-2">
        <WireResultCard score={92} name="Jane Smith" platform="📸" rank={1} />
        <WireResultCard score={78} name="Mark Davis" platform="🐦" rank={2} />
        <WireResultCard score={65} name="Sam Lee" platform="▶️" rank={3} />
      </div>
    </div>
  );
}

function WireModal() {
  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-xl z-10">
      <div className="bg-[#0f1b2d] border border-slate-700 rounded-xl p-4 w-64 text-[9px] font-mono shadow-2xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-lg">📸</div>
          <div>
            <div className="h-2.5 w-24 bg-slate-400/60 rounded mb-1" />
            <div className="h-2 w-16 bg-slate-600/40 rounded" />
          </div>
        </div>
        {/* score bar */}
        <div className="flex items-center gap-3 bg-slate-800/50 rounded-lg p-2.5 mb-3">
          <div className="text-2xl font-black text-emerald-400">92</div>
          <div>
            <div className="h-2 w-20 bg-slate-600/40 rounded mb-1" />
            <div className="text-emerald-400/70 text-[8px]">High Priority</div>
          </div>
        </div>
        {/* metrics */}
        <div className="grid grid-cols-4 gap-1 mb-3">
          {['Followers', 'Engage', 'Likes', 'Posts/wk'].map((l) => (
            <div key={l} className="bg-slate-800/40 rounded p-1 text-center">
              <div className="h-2 w-6 bg-slate-500/50 rounded mx-auto mb-0.5" />
              <div className="text-slate-500 text-[7px]">{l}</div>
            </div>
          ))}
        </div>
        {/* AI summary */}
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-2.5">
          <div className="text-emerald-400/70 text-[8px] mb-1.5">🤖 Why This Influencer Matters</div>
          <div className="space-y-1">
            <div className="h-1.5 w-full bg-slate-600/30 rounded" />
            <div className="h-1.5 w-5/6 bg-slate-600/30 rounded" />
            <div className="h-1.5 w-4/5 bg-slate-600/30 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

function WireDashboard() {
  return (
    <div className="bg-[#0a1628] border border-slate-600/40 rounded-xl p-4 text-[10px] font-mono w-full">
      <div className="text-slate-500 mb-3 text-[9px] uppercase tracking-widest">Campaign Dashboard (M2)</div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: 'Active Campaigns', val: '3', c: 'text-yellow-400' },
          { label: 'Influencers Tracked', val: '47', c: 'text-emerald-400' },
          { label: 'Outreach Sent', val: '12', c: 'text-blue-400' },
        ].map(({ label, val, c }) => (
          <div key={label} className="bg-slate-800/50 border border-slate-700/40 rounded-lg p-3 text-center">
            <div className={`text-xl font-black ${c}`}>{val}</div>
            <div className="text-slate-500 text-[8px] mt-0.5">{label}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-3">
          <div className="text-slate-400 text-[8px] uppercase tracking-wide mb-2">Campaigns</div>
          {['Ohio Senate Race', 'TX Governor 2026', 'GA Climate PAC'].map((c, i) => (
            <div key={c} className="flex items-center gap-2 mb-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-emerald-400' : i === 1 ? 'bg-yellow-400' : 'bg-blue-400'}`} />
              <div className="h-2 flex-1 bg-slate-600/40 rounded" />
              <div className="text-slate-500 text-[8px]">{[12, 9, 7][i]} infl.</div>
            </div>
          ))}
        </div>
        <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-3">
          <div className="text-slate-400 text-[8px] uppercase tracking-wide mb-2">Outreach Pipeline</div>
          {[['Contacted', 12, 'blue'], ['Replied', 5, 'yellow'], ['Signed', 2, 'emerald']].map(([l, n, c]) => (
            <div key={String(l)} className="flex items-center gap-2 mb-1.5">
              <div className="h-1.5 flex-1 bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full bg-${c}-500/60 rounded-full`} style={{ width: `${Number(n) * 8}%` }} />
              </div>
              <div className="text-slate-400 text-[8px] w-12 text-right">{l}: {n}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── page ────────────────────────────────────────────────────────────────────

export default function PitchPage() {
  return (
    <div className="min-h-screen bg-[#0a1628] text-slate-200">
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-[#0a1628]/95 backdrop-blur-sm px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🗳️</span>
          <span className="font-black text-lg text-white tracking-tight">
            Al-MOG<span style={{ color: '#c9a84c' }}>.io</span>
          </span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <a href="#concept" className="text-slate-400 hover:text-white transition-colors hidden sm:block">Concept</a>
          <a href="#scenarios" className="text-slate-400 hover:text-white transition-colors hidden sm:block">Scenarios</a>
          <a href="#wireframes" className="text-slate-400 hover:text-white transition-colors hidden sm:block">Wireframes</a>
          <a href="#roadmap" className="text-slate-400 hover:text-white transition-colors hidden sm:block">Roadmap</a>
          <Link href="/search" className="px-4 py-1.5 text-sm font-bold rounded-lg text-black" style={{ background: 'linear-gradient(to right, #f59e0b, #d97706)' }}>
            Live Demo →
          </Link>
        </div>
      </nav>

      {/* ── Cover ── */}
      <section className="relative overflow-hidden px-6 py-24 text-center border-b border-slate-800">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #c9a84c 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border mb-6" style={{ borderColor: 'rgb(201 168 76 / 0.3)', color: '#c9a84c', background: 'rgb(201 168 76 / 0.08)' }}>
            PRODUCT PROPOSAL · CONFIDENTIAL
          </div>
          <h1 className="text-5xl sm:text-7xl font-black text-white leading-none mb-4 tracking-tight">
            Al-MOG<span style={{ color: '#c9a84c' }}>.io</span>
          </h1>
          <p className="text-xl sm:text-2xl text-slate-300 font-light mb-3">
            Political Influencer Intelligence Platform
          </p>
          <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed mb-10">
            An AI-powered platform that finds, scores, and ranks social media influencers across every major platform — purpose-built for political campaigns, PACs, and advocacy organizations.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            {[
              { label: 'Problem', val: 'Manual influencer research takes weeks' },
              { label: 'Solution', val: 'AI agent delivers ranked list in seconds' },
              { label: 'Market', val: 'Political campaigns spend $10B+ on media' },
              { label: 'Edge', val: 'Only tool built specifically for politics' },
            ].map(({ label, val }) => (
              <div key={label} className="px-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-left min-w-[180px]">
                <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-0.5">{label}</div>
                <div className="text-sm text-white font-medium">{val}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Concept ── */}
      <section id="concept" className="px-6 py-20 border-b border-slate-800">
        <div className="max-w-5xl mx-auto">
          <SectionLabel step="01" label="Concept" />
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">The Core Idea</h2>
          <p className="text-slate-400 max-w-2xl mb-12 leading-relaxed">
            Political candidates waste enormous time identifying relevant social media voices. Al-MOG.io automates the entire discovery-to-ranking pipeline using a free open-source AI agent.
          </p>

          {/* Flow diagram */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
            {[
              { icon: '🎯', label: 'Campaign Parameters', sub: 'Keywords, location, platforms, topics' },
              { icon: '→', label: '', sub: '', arrow: true },
              { icon: '📡', label: 'Multi-Platform Scan', sub: 'Instagram · Twitter · YouTube · TikTok · Facebook' },
              { icon: '→', label: '', sub: '', arrow: true },
              { icon: '🤖', label: 'AI Analysis', sub: 'Llama 3.3 70B scores each profile 0-100' },
              { icon: '→', label: '', sub: '', arrow: true },
              { icon: '🏆', label: 'Ranked Shortlist', sub: 'Filtered, sorted, ready to contact' },
            ].map(({ icon, label, sub, arrow }, i) => (
              arrow ? (
                <div key={i} className="text-2xl text-slate-600 hidden sm:block">→</div>
              ) : (
                <div key={i} className="flex flex-col items-center text-center p-4 bg-[#0f1b2d] border border-slate-700/50 rounded-xl w-44">
                  <div className="text-3xl mb-2">{icon}</div>
                  <div className="text-sm font-bold text-white mb-1">{label}</div>
                  <div className="text-[10px] text-slate-500 leading-snug">{sub}</div>
                </div>
              )
            ))}
          </div>

          {/* Value props */}
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: '⏱️', title: 'Hours → Seconds', desc: 'What takes a campaign staffer 40+ hours of manual research happens in under 30 seconds.' },
              { icon: '🆓', title: 'Free AI Core', desc: 'Built on Groq + Llama 3.3 70B — open-source, 7,500 free requests/day, no vendor lock-in.' },
              { icon: '🎯', title: 'Politics-Specific', desc: 'Scoring model trained on political relevance signals, not generic "brand fit" metrics.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="p-5 bg-[#0f1b2d] border border-slate-700/50 rounded-xl hover:border-yellow-500/30 transition-colors">
                <div className="text-2xl mb-3">{icon}</div>
                <div className="font-bold text-white mb-2">{title}</div>
                <div className="text-sm text-slate-400 leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Scenarios ── */}
      <section id="scenarios" className="px-6 py-20 border-b border-slate-800 bg-[#0c1a2e]">
        <div className="max-w-5xl mx-auto">
          <SectionLabel step="02" label="Usage Scenarios" />
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Who Uses Al-MOG.io</h2>
          <p className="text-slate-400 max-w-2xl mb-12 leading-relaxed">
            Four primary user personas, each with distinct workflows and outcomes.
          </p>
          <div className="grid sm:grid-cols-2 gap-5">
            {SCENARIOS.map((s) => (
              <div key={s.persona} className={`bg-gradient-to-br ${s.color} border ${s.border} rounded-2xl p-6`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl">{s.icon}</div>
                  <div>
                    <div className="font-black text-white text-lg leading-tight">{s.persona}</div>
                    <div className="text-xs text-slate-400">{s.name}</div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mb-3 leading-relaxed">{s.context}</p>
                <blockquote className="text-sm text-slate-300 italic border-l-2 border-slate-500 pl-3 mb-4 leading-relaxed">
                  {s.need}
                </blockquote>
                <div className="mb-4">
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">User Flow</div>
                  <ol className="space-y-1">
                    {s.flow.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <span className="text-slate-500 mt-0.5 shrink-0">{i + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="flex items-center gap-2 bg-black/20 rounded-lg px-3 py-2">
                  <span className="text-sm">✅</span>
                  <span className="text-xs text-slate-300">{s.outcome}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Wireframes ── */}
      <section id="wireframes" className="px-6 py-20 border-b border-slate-800">
        <div className="max-w-6xl mx-auto">
          <SectionLabel step="03" label="Wireframes" />
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Interface Wire Mocks</h2>
          <p className="text-slate-400 max-w-2xl mb-12 leading-relaxed">
            Annotated wireframes for the three core screens. All screens use the dark navy / gold design language.
          </p>

          {/* Wire 1 — Main search */}
          <div className="mb-12">
            <WireLabel num="Screen 1" title="Search + Results (Main View — POC & M1)" />
            <div className="bg-[#060e1a] border border-slate-800 rounded-2xl p-4 overflow-x-auto">
              {/* Simulated browser chrome */}
              <div className="bg-slate-800/50 rounded-t-xl px-4 py-2 flex items-center gap-2 mb-0 border-b border-slate-700/40">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                <div className="flex-1 bg-slate-700/40 rounded h-4 mx-4 flex items-center px-3">
                  <span className="text-[9px] text-slate-500">al-mog.io/search</span>
                </div>
              </div>
              {/* App chrome */}
              <div className="border border-slate-700/30 rounded-b-xl overflow-hidden">
                {/* Header */}
                <div className="bg-[#0a1628] border-b border-slate-800 px-4 py-2 flex items-center gap-3">
                  <span className="text-sm">🗳️</span>
                  <span className="text-xs font-black text-white">Al-MOG<span style={{ color: '#c9a84c' }}>.io</span></span>
                  <div className="h-3 w-px bg-slate-700 mx-1" />
                  <span className="text-[10px] text-slate-500">Influencer Search</span>
                  <div className="ml-auto flex gap-2">
                    <div className="h-5 w-10 bg-slate-700 rounded-full" />
                    <div className="h-5 w-16 bg-yellow-500/60 rounded-lg" />
                  </div>
                </div>
                {/* Body */}
                <div className="flex bg-[#0a1628]" style={{ minHeight: 320 }}>
                  <div className="border-r border-slate-800 p-4 bg-[#0f1b2d]">
                    <WireSearchForm />
                  </div>
                  <div className="flex-1 p-4 relative min-w-0">
                    <WireResults />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 grid sm:grid-cols-3 gap-3">
              {[
                { ann: '① Search Panel', desc: 'Sticky sidebar. Parameters persist across searches. Collapsible on mobile.' },
                { ann: '② Results Grid', desc: 'Ranked cards sorted by AI score. Toggle to list view. Sort & filter controls top-right.' },
                { ann: '③ Tier Gate', desc: 'PRO badge and "Upgrade" CTA in header. Export button grayed for free users.' },
              ].map(({ ann, desc }) => (
                <div key={ann} className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-3">
                  <div className="text-xs font-bold text-yellow-400 mb-1">{ann}</div>
                  <div className="text-xs text-slate-400">{desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Wire 2 — Detail modal */}
          <div className="mb-12">
            <WireLabel num="Screen 2" title="Influencer Detail Modal (POC & M1)" />
            <div className="bg-[#060e1a] border border-slate-800 rounded-2xl p-6 overflow-x-auto">
              <div className="flex justify-center">
                <div className="relative w-full max-w-2xl">
                  {/* blurred background hint */}
                  <div className="bg-[#0a1628] rounded-xl p-4 blur-sm opacity-40 select-none">
                    <div className="flex gap-4">
                      <div className="w-64 bg-[#0f1b2d] rounded-xl p-4 h-48" />
                      <div className="flex-1 space-y-3">
                        <div className="h-4 bg-slate-800 rounded w-full" />
                        <div className="h-4 bg-slate-800 rounded w-5/6" />
                        <div className="h-4 bg-slate-800 rounded w-4/6" />
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <WireModal />
                  </div>
                  <div className="h-72" />
                </div>
              </div>
            </div>
            <div className="mt-4 grid sm:grid-cols-3 gap-3">
              {[
                { ann: '① Score Banner', desc: 'Large AI score + tier label front and center. Estimated reach alongside.' },
                { ann: '② Metrics Grid', desc: 'Followers, engagement, avg likes, posts/week — at a glance.' },
                { ann: '③ AI Reasoning', desc: 'Green panel shows exactly why Llama 3.3 scored this influencer for this campaign.' },
              ].map(({ ann, desc }) => (
                <div key={ann} className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-3">
                  <div className="text-xs font-bold text-yellow-400 mb-1">{ann}</div>
                  <div className="text-xs text-slate-400">{desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Wire 3 — Campaign dashboard */}
          <div>
            <WireLabel num="Screen 3" title="Campaign Dashboard (Milestone 2)" />
            <div className="bg-[#060e1a] border border-slate-800 rounded-2xl p-4 overflow-x-auto">
              <div className="border border-slate-700/30 rounded-xl overflow-hidden">
                <div className="bg-[#0a1628] border-b border-slate-800 px-4 py-2 flex items-center gap-3">
                  <span className="text-sm">🗳️</span>
                  <span className="text-xs font-black text-white">Al-MOG<span style={{ color: '#c9a84c' }}>.io</span></span>
                  <div className="h-3 w-px bg-slate-700 mx-1" />
                  <span className="text-[10px] text-slate-500">Campaign Manager</span>
                  <div className="ml-auto flex gap-2">
                    <div className="h-5 w-16 bg-yellow-500/60 rounded-lg" />
                  </div>
                </div>
                <div className="p-4 bg-[#0a1628]">
                  <WireDashboard />
                </div>
              </div>
            </div>
            <div className="mt-4 grid sm:grid-cols-3 gap-3">
              {[
                { ann: '① Campaign Cards', desc: 'Each active campaign with influencer count, status, and quick-search shortcut.' },
                { ann: '② Outreach Pipeline', desc: 'Kanban-style tracker: contacted → replied → signed. Syncs with CSV export.' },
                { ann: '③ Overlap Detection', desc: 'Visual indicator when the same influencer appears in multiple campaigns.' },
              ].map(({ ann, desc }) => (
                <div key={ann} className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-3">
                  <div className="text-xs font-bold text-yellow-400 mb-1">{ann}</div>
                  <div className="text-xs text-slate-400">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Roadmap ── */}
      <section id="roadmap" className="px-6 py-20 border-b border-slate-800 bg-[#0c1a2e]">
        <div className="max-w-5xl mx-auto">
          <SectionLabel step="04" label="Phased Roadmap" />
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Delivery Plan</h2>
          <p className="text-slate-400 max-w-2xl mb-12 leading-relaxed">
            Four clearly-scoped phases from working proof-of-concept to full intelligence platform.
          </p>

          {/* Timeline bar */}
          <div className="flex items-center gap-0 mb-12 overflow-x-auto">
            {PHASES.map((p, i) => (
              <div key={p.id} className="flex items-center gap-0">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full ${p.dotColor} flex items-center justify-center text-xs font-black text-white shadow-lg`}>{p.label}</div>
                  <div className="text-[9px] text-slate-500 mt-1 whitespace-nowrap">{p.timeline}</div>
                </div>
                {i < PHASES.length - 1 && (
                  <div className="h-0.5 w-16 sm:w-32 bg-slate-700 mx-1 mb-4 relative">
                    {i === 0 && <div className="absolute inset-0 bg-emerald-500/60" />}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Phase cards */}
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {PHASES.map((p) => (
              <div key={p.id} className={`border-t-4 ${p.borderColor} bg-[#0f1b2d] border border-slate-700/50 rounded-xl p-5 flex flex-col`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${p.badgeColor}`}>
                    {p.label}
                  </span>
                  <span className="text-[10px] text-slate-500">{p.timeline}</span>
                </div>
                <h3 className="font-black text-white text-lg leading-tight mb-0.5">{p.title}</h3>
                <p className="text-xs text-slate-400 mb-4">{p.subtitle}</p>
                <ul className="space-y-1.5 flex-1 mb-4">
                  {p.deliverables.map((d) => (
                    <li key={d} className="flex items-start gap-1.5 text-xs text-slate-300">
                      <span className="text-slate-500 mt-0.5 shrink-0">›</span>
                      {d}
                    </li>
                  ))}
                </ul>
                <div className="grid grid-cols-2 gap-1.5 pt-3 border-t border-slate-700/40">
                  {p.metrics.map((m) => (
                    <div key={m} className="bg-slate-800/50 rounded px-2 py-1 text-[9px] text-slate-400 text-center truncate">{m}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section className="px-6 py-20 border-b border-slate-800">
        <div className="max-w-5xl mx-auto">
          <SectionLabel step="05" label="Technology" />
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Technical Foundation</h2>
          <p className="text-slate-400 max-w-2xl mb-10 leading-relaxed">
            Modern, open-source, and cost-efficient stack. No proprietary AI lock-in.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { layer: 'Frontend', tech: 'Next.js 14 + TypeScript', detail: 'App Router, SSR, static generation', icon: '⚡' },
              { layer: 'AI Engine', tech: 'Groq + Llama 3.3 70B', detail: 'Free tier, 7,500 req/day, JSON mode', icon: '🤖' },
              { layer: 'Styling', tech: 'Tailwind CSS', detail: 'Navy/gold political design system', icon: '🎨' },
              { layer: 'Data APIs', tech: 'YouTube · Twitter · more', detail: 'Real APIs in M1, stubs in POC', icon: '📡' },
              { layer: 'Database', tech: 'Prisma + SQLite/Postgres', detail: 'SQLite for dev, Postgres for prod', icon: '🗄️' },
              { layer: 'Auth', tech: 'Next-Auth (M1)', detail: 'Email + OAuth (Google, GitHub)', icon: '🔐' },
              { layer: 'Hosting', tech: 'Vercel / Railway', detail: 'Edge-ready, auto-deploy from git', icon: '☁️' },
              { layer: 'Export', tech: 'CSV + PDF (PRO)', detail: 'jsPDF + custom template (M1)', icon: '📄' },
            ].map(({ layer, tech, detail, icon }) => (
              <div key={layer} className="bg-[#0f1b2d] border border-slate-700/50 rounded-xl p-4 hover:border-yellow-500/30 transition-colors">
                <div className="text-xl mb-2">{icon}</div>
                <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-0.5">{layer}</div>
                <div className="text-sm font-bold text-white mb-1">{tech}</div>
                <div className="text-[10px] text-slate-400 leading-relaxed">{detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-black text-white mb-4">Ready to See It Live?</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            The POC is fully deployed. Try a real search — add keywords, select platforms, and watch the AI agent rank influencers in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/search"
              className="px-8 py-4 text-base font-black rounded-xl text-black shadow-lg transition-transform hover:scale-105"
              style={{ background: 'linear-gradient(to right, #f59e0b, #d97706)', boxShadow: '0 0 30px rgb(245 158 11 / 0.3)' }}
            >
              🔍 Try the Live Demo
            </Link>
            <Link
              href="/"
              className="px-8 py-4 text-base font-semibold rounded-xl text-slate-300 border border-slate-700 hover:border-slate-500 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-600">
        Al-MOG.io · Product Proposal · Confidential · {new Date().getFullYear()}
      </footer>
    </div>
  );
}

// ─── shared sub-components ───────────────────────────────────────────────────

function SectionLabel({ step, label }: { step: string; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-xs font-black" style={{ color: '#c9a84c' }}>{step}</span>
      <div className="h-px flex-1 max-w-[40px]" style={{ background: '#c9a84c' }} />
      <span className="text-xs uppercase tracking-widest text-slate-500">{label}</span>
    </div>
  );
}

function WireLabel({ num, title }: { num: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-xs font-black px-2 py-0.5 rounded border text-yellow-400 border-yellow-500/30 bg-yellow-500/10">{num}</span>
      <span className="text-sm font-bold text-white">{title}</span>
    </div>
  );
}
