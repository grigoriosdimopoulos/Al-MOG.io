'use client';

import { UserTier } from '@/types/influencer';

export function TierBadge({ tier }: { tier: UserTier }) {
  if (tier === 'paid') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-500 to-amber-400 text-black">
        ★ PRO
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-700 text-slate-300">
      FREE
    </span>
  );
}
