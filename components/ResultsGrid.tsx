'use client';

import { useState } from 'react';
import { RankedInfluencer, SearchResult, UserTier } from '@/types/influencer';
import { InfluencerCard } from './InfluencerCard';
import { InfluencerModal } from './InfluencerModal';
import { TierBadge } from './TierBadge';
import { formatNumber } from '@/lib/utils';

type SortKey = 'relevanceScore' | 'followers' | 'engagementRate';

function exportCSV(influencers: RankedInfluencer[]) {
  const headers = ['Rank', 'Name', 'Username', 'Platform', 'Followers', 'Engagement%', 'AI Score', 'Location', 'Topics', 'AI Summary'];
  const rows = influencers.map((inf, i) => [
    i + 1, inf.displayName, `@${inf.username}`, inf.platform,
    inf.followers, inf.engagementRate, inf.relevanceScore,
    inf.location, inf.politicalTopics.join(' | '), inf.aiSummary.replace(/,/g, ';'),
  ]);
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `influencers-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

interface Props {
  result: SearchResult | null;
  tier: UserTier;
}

export function ResultsGrid({ result, tier }: Props) {
  const [selected, setSelected] = useState<RankedInfluencer | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>('relevanceScore');
  const [showUpgrade, setShowUpgrade] = useState(false);

  if (!result) return null;

  const sorted = [...result.influencers].sort((a, b) => b[sortBy] - a[sortBy]);

  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-white">
            {result.influencers.length} Influencers Found
          </h2>
          <p className="text-xs text-slate-400">
            Analyzed {result.totalFound} profiles · <TierBadge tier={result.tier} />
            {result.tier === 'free' && <span className="ml-2 text-slate-500">(showing top 10)</span>}
          </p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
          >
            <option value="relevanceScore">Sort: AI Score</option>
            <option value="followers">Sort: Followers</option>
            <option value="engagementRate">Sort: Engagement</option>
          </select>

          {/* Export */}
          {tier === 'paid' ? (
            <button
              onClick={() => exportCSV(sorted)}
              className="px-3 py-1.5 text-xs font-semibold bg-gold/10 border border-gold/30 text-gold rounded-lg hover:bg-gold/20 transition-colors"
            >
              ↓ Export CSV
            </button>
          ) : (
            <button
              onClick={() => setShowUpgrade(true)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-700/50 border border-slate-600 text-slate-400 rounded-lg hover:border-gold/30 hover:text-slate-300 transition-colors"
            >
              🔒 Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Total Reach', value: formatNumber(sorted.reduce((s, inf) => s + inf.reachEstimate, 0)) },
          { label: 'Avg AI Score', value: Math.round(sorted.reduce((s, inf) => s + inf.relevanceScore, 0) / sorted.length) },
          { label: 'Avg Engagement', value: `${(sorted.reduce((s, inf) => s + inf.engagementRate, 0) / sorted.length).toFixed(1)}%` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-slate-800/40 rounded-xl p-3 text-center border border-slate-700/40">
            <div className="text-lg font-black text-white">{value}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</div>
          </div>
        ))}
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {sorted.map((inf, i) => (
          <InfluencerCard
            key={inf.id}
            influencer={inf}
            rank={i + 1}
            onClick={() => setSelected(inf)}
          />
        ))}
      </div>

      {/* Upgrade modal */}
      {showUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowUpgrade(false)}>
          <div className="bg-[#0f1b2d] border border-gold/30 rounded-2xl max-w-sm w-full p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="text-4xl mb-3">⭐</div>
            <h3 className="text-xl font-bold text-white mb-2">Upgrade to PRO</h3>
            <p className="text-sm text-slate-400 mb-4">Unlock CSV export, 100 results per search, unlimited daily searches, and real social media API data.</p>
            <button className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-yellow-500 to-amber-400 text-black">
              Get PRO Access
            </button>
            <button onClick={() => setShowUpgrade(false)} className="mt-3 text-xs text-slate-500 hover:text-slate-300">Cancel</button>
          </div>
        </div>
      )}

      <InfluencerModal influencer={selected} onClose={() => setSelected(null)} />
    </>
  );
}
