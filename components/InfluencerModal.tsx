'use client';

import { RankedInfluencer } from '@/types/influencer';
import { formatNumber, platformBg, scoreColor } from '@/lib/utils';
import { useEffect } from 'react';

const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  twitter: 'X / Twitter',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  facebook: 'Facebook',
};

interface Props {
  influencer: RankedInfluencer | null;
  onClose: () => void;
}

export function InfluencerModal({ influencer, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!influencer) return null;

  const scoreCol = scoreColor(influencer.relevanceScore);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-[#0f1b2d] border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl leading-none"
        >
          ✕
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-5">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${platformBg(influencer.platform)} shadow-lg`}>
            {influencer.platform === 'instagram' ? '📸' : influencer.platform === 'twitter' ? '🐦' : influencer.platform === 'youtube' ? '▶️' : influencer.platform === 'tiktok' ? '🎵' : '👥'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{influencer.displayName}</h2>
              {influencer.verifiedAccount && <span className="text-blue-400 text-sm">✓</span>}
            </div>
            <div className="text-sm text-slate-400">
              @{influencer.username} · {PLATFORM_LABELS[influencer.platform]}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">{influencer.location} · {influencer.language}</div>
          </div>
        </div>

        {/* Score banner */}
        <div className="flex items-center gap-4 bg-slate-800/60 rounded-xl p-4 mb-5">
          <div className={`text-4xl font-black ${scoreCol}`}>{influencer.relevanceScore}</div>
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">AI Relevance Score</div>
            <div className={`text-sm font-semibold capitalize ${scoreCol}`}>{influencer.tier} priority influencer</div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-sm font-bold text-white">{formatNumber(influencer.reachEstimate)}</div>
            <div className="text-xs text-slate-400">Est. Reach</div>
          </div>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {[
            { label: 'Followers', value: formatNumber(influencer.followers) },
            { label: 'Engagement', value: `${influencer.engagementRate}%` },
            { label: 'Avg Likes', value: formatNumber(influencer.avgLikes) },
            { label: 'Posts/wk', value: influencer.postsPerWeek.toString() },
          ].map(({ label, value }) => (
            <div key={label} className="bg-slate-800/40 rounded-lg p-2 text-center">
              <div className="text-sm font-bold text-white">{value}</div>
              <div className="text-[10px] text-slate-500">{label}</div>
            </div>
          ))}
        </div>

        {/* Bio */}
        <div className="mb-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Bio</div>
          <p className="text-sm text-slate-300 leading-relaxed">{influencer.bio}</p>
        </div>

        {/* Topics */}
        <div className="mb-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Political Topics</div>
          <div className="flex flex-wrap gap-1.5">
            {influencer.politicalTopics.map((topic) => (
              <span key={topic} className="text-xs px-2.5 py-1 rounded-full bg-gold/10 text-gold border border-gold/20 capitalize">
                {topic}
              </span>
            ))}
          </div>
        </div>

        {/* AI Summary */}
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">🤖</span>
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">Why This Influencer Matters</div>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{influencer.aiSummary}</p>
        </div>
      </div>
    </div>
  );
}
