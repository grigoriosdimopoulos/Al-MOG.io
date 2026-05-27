import Link from 'next/link';

const FEATURES = [
  { icon: '🤖', title: 'AI-Powered Ranking', desc: 'Llama 3.3 70B analyzes every profile and scores political relevance 0–100' },
  { icon: '📡', title: 'All Major Platforms', desc: 'Instagram, X/Twitter, YouTube, TikTok, and Facebook in one search' },
  { icon: '🎯', title: 'Precision Targeting', desc: 'Filter by location, follower range, engagement rate, and political topics' },
  { icon: '⚡', title: 'Real-Time Analysis', desc: 'Get ranked results in seconds, not days of manual research' },
];

const STATS = [
  { value: '5', label: 'Platforms' },
  { value: 'AI', label: 'Powered by Llama 3.3' },
  { value: '100+', label: 'Metrics Analyzed' },
  { value: 'Free', label: 'To Start' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col">
      {/* Nav */}
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🗳️</span>
          <span className="font-black text-xl text-white tracking-tight">Al-MOG<span style={{ color: '#c9a84c' }}>.io</span></span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 hidden sm:block">Political Influencer Intelligence</span>
          <Link
            href="/search"
            className="px-4 py-2 text-sm font-bold rounded-lg text-black transition-all"
            style={{ background: 'linear-gradient(to right, #f59e0b, #d97706)' }}
          >
            Start Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border mb-6"
          style={{ borderColor: 'rgb(201 168 76 / 0.3)', color: '#c9a84c', background: 'rgb(201 168 76 / 0.08)' }}>
          🤖 Powered by Llama 3.3 70B · Open Source AI
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight mb-6 max-w-3xl">
          Find Political Influencers{' '}
          <span style={{ color: '#c9a84c' }}>Who Win Elections</span>
        </h1>

        <p className="text-lg text-slate-400 max-w-xl mb-10 leading-relaxed">
          Set your campaign parameters and let our free AI agent scan Instagram, Twitter, YouTube, TikTok and Facebook to surface the most politically relevant influencers — ranked by real impact potential.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Link
            href="/search"
            className="px-8 py-4 text-base font-black rounded-xl text-black shadow-lg transition-transform hover:scale-105"
            style={{ background: 'linear-gradient(to right, #f59e0b, #d97706)', boxShadow: '0 0 30px rgb(245 158 11 / 0.3)' }}
          >
            🔍 Start Free Search
          </Link>
          <span className="text-sm text-slate-500">No credit card · 3 free searches/day</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-20 max-w-2xl w-full">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-black text-white mb-1">{value}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wide">{label}</div>
            </div>
          ))}
        </div>
      </main>

      {/* Features */}
      <section className="border-t border-slate-800 px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-white text-center mb-10">How It Works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} className="bg-[#0f1b2d] border border-slate-700/50 rounded-xl p-5 hover:border-yellow-500/30 transition-colors">
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="font-bold text-white mb-2 text-sm">{title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free vs Pro */}
      <section className="border-t border-slate-800 px-6 py-16 bg-[#0f1b2d]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-black text-white mb-8">Free vs PRO</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="border border-slate-700 rounded-xl p-6 text-left">
              <div className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-700 text-slate-300 mb-4">FREE</div>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>✓ 3 searches per day</li>
                <li>✓ Top 10 ranked results</li>
                <li>✓ All 5 platforms</li>
                <li>✓ AI relevance scoring</li>
                <li className="text-slate-500">✗ CSV/PDF export</li>
                <li className="text-slate-500">✗ Real API data</li>
                <li className="text-slate-500">✗ Search history</li>
              </ul>
            </div>
            <div className="border rounded-xl p-6 text-left" style={{ borderColor: 'rgb(201 168 76 / 0.4)', background: 'rgb(201 168 76 / 0.04)' }}>
              <div className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold mb-4 text-black" style={{ background: 'linear-gradient(to right, #f59e0b, #d97706)' }}>★ PRO</div>
              <ul className="space-y-2 text-sm text-slate-300">
                <li style={{ color: '#c9a84c' }}>★ Unlimited searches</li>
                <li style={{ color: '#c9a84c' }}>★ 100 results per search</li>
                <li style={{ color: '#c9a84c' }}>★ Real social API data</li>
                <li style={{ color: '#c9a84c' }}>★ CSV + PDF export</li>
                <li style={{ color: '#c9a84c' }}>★ Search history</li>
                <li style={{ color: '#c9a84c' }}>★ Priority AI processing</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-600">
        Al-MOG.io · Political Influencer Intelligence Platform · AI by Groq + Llama 3.3
      </footer>
    </div>
  );
}
