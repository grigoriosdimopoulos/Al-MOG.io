import { UserTier } from '@/types/influencer';

const FREE_DAILY_LIMIT = 3;
const FREE_RESULTS_LIMIT = 10;
const PAID_RESULTS_LIMIT = 100;

const searchCounts = new Map<string, { count: number; date: string }>();

export function detectTier(request: Request): UserTier {
  const tierSecret = request.headers.get('x-tier-secret');
  if (tierSecret && tierSecret === process.env.TIER_SECRET) {
    return 'paid';
  }
  return 'free';
}

export function getResultsLimit(tier: UserTier): number {
  return tier === 'paid' ? PAID_RESULTS_LIMIT : FREE_RESULTS_LIMIT;
}

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const today = new Date().toISOString().split('T')[0];
  const key = `${ip}-${today}`;
  const current = searchCounts.get(key);

  if (!current || current.date !== today) {
    searchCounts.set(key, { count: 0, date: today });
  }

  const entry = searchCounts.get(key)!;
  const remaining = FREE_DAILY_LIMIT - entry.count;

  if (remaining <= 0) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining };
}

export function incrementRateLimit(ip: string): void {
  const today = new Date().toISOString().split('T')[0];
  const key = `${ip}-${today}`;
  const current = searchCounts.get(key) || { count: 0, date: today };
  searchCounts.set(key, { count: current.count + 1, date: today });
}
