import { NextRequest, NextResponse } from 'next/server';
import { SearchParams } from '@/types/influencer';
import { rankInfluencers } from '@/lib/ai-agent';
import { fetchCandidates } from '@/lib/platforms';
import { detectTier, getResultsLimit, checkRateLimit, incrementRateLimit } from '@/lib/tier';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const tier = detectTier(req);

  if (tier === 'free') {
    const { allowed, remaining } = checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Daily search limit reached. Upgrade to PRO for unlimited searches.', code: 'RATE_LIMIT' },
        { status: 429 }
      );
    }
  }

  let params: SearchParams;
  try {
    params = await req.json() as SearchParams;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!params.keywords || params.keywords.length === 0) {
    return NextResponse.json({ error: 'At least one keyword is required' }, { status: 400 });
  }

  if (!params.platforms || params.platforms.length === 0) {
    params.platforms = ['twitter', 'instagram', 'youtube'];
  }

  params.followerMin = params.followerMin ?? 1000;
  params.followerMax = params.followerMax ?? 10000000;
  params.engagementMin = params.engagementMin ?? 0;

  const limit = getResultsLimit(tier);
  const candidateLimit = limit * 3;

  try {
    const candidates = await fetchCandidates(params, candidateLimit);
    const ranked = await rankInfluencers(params, candidates);
    const results = ranked.slice(0, limit);

    if (tier === 'free') {
      incrementRateLimit(ip);
    }

    return NextResponse.json({
      influencers: results,
      totalFound: ranked.length,
      tier,
      searchId: `search-${Date.now()}`,
    });
  } catch (err) {
    console.error('Search error:', err);
    return NextResponse.json(
      { error: 'Search failed. Please try again.' },
      { status: 500 }
    );
  }
}
