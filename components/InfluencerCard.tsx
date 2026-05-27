'use client';

import { RankedInfluencer } from '@/types/influencer';
import { formatNumber, platformBg, scoreColor } from '@/lib/utils';

const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  twitter: 'X / Twitter',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  facebook: 'Facebook',
};

const PLATFORM_ICONS: Record<string, string> = {
  instagram: '📸',
  twitter: '🐦',
  youtube: '▶️',
  tiktok: '🎵',
  facebook: '👥',
};

interface Props {
  influencer: RankedInfluencer;
  rank: number;
  onClick: () => void;
}

export function InfluencerCard({ influencer, rank, onClick }: Props) {
  const scoreCol = scoreColor(influencer.relevanceScore);

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-navy-800 border border-slate-700/60 rounded-xl p-5 hover:border-gold/40 hover:bg-navy-700 transition-all duration-200 group"
    >
      <div className="flex items-start gap-4">
        {/* Rank */}
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
          {rank}
        </div>

        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${platformBg(influencer.platform)} shadow-lg`}>
            {PLATFORM_ICONS[influencer.platform]}
          </div>
          {influencer.verifiedAccount && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-[10px]">✓</div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-semibold text-white truncate">{influencer.displayName}</span>
          </div>
          <div className="text-xs text-slate-400 mb-2">
            @{influencer.username} · {PLATFORM_LABELS[influencer.platform]}
          </div>
          <div className="flex flex-wrap gap-1 mb-3">
            {influencer.politicalTopics.slice(0, 3).map((topic) => (
              <span key={topic} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 capitalize">
                {topic}
              </span>
            ))}
          </div>

          {/* Metrics row */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-800/60 rounded-lg py-1.5">
              <div className="text-sm font-bold text-white">{formatNumber(influencer.followers)}</div>
              <div className="text-[10px] text-slate-500">Followers</div>
            </div>
            <div className="bg-slate-800/60 rounded-lg py-1.5">
              <div className="text-sm font-bold text-white">{influencer.engagementRate}%</div>
              <div className="text-[10px] text-slate-500">Engagement</div>
            </div>
            <div className="bg-slate-800/60 rounded-lg py-1.5">
              <div className={`text-sm font-bold ${scoreCol}`}>{influencer.relevanceScore}</div>
              <div className="text-[10px] text-slate-500">AI Score</div>
            </div>
          </div>
        </div>

        {/* Score ring */}
        <div className="flex-shrink-0 flex flex-col items-center">
          <div
            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-sm ${scoreCol}`}
            style={{ borderColor: influencer.relevanceScore >= 80 ? '#34d399' : influencer.relevanceScore >= 60 ? '#fbbf24' : '#fb923c' }}
          >
            {influencer.relevanceScore}
          </div>
          <span className="text-[9px] text-slate-500 mt-1 uppercase tracking-wide">
            {influencer.tier}
          </span>
        </div>
      </div>

      {/* AI Summary preview */}
      <div className="mt-3 pt-3 border-t border-slate-700/40">
        <p className="text-xs text-slate-400 line-clamp-2 group-hover:text-slate-300 transition-colors">
          {influencer.aiSummary}
        </p>
      </div>
    </button>
  );
}
