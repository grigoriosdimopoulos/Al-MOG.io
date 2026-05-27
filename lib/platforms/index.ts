import { Influencer, Platform, SearchParams } from '@/types/influencer';
import { generateMockInfluencers } from '@/lib/mock-data';
import { searchYouTubeInfluencers } from './youtube';
import { searchTwitterInfluencers } from './twitter';

export async function fetchCandidates(params: SearchParams, limit: number): Promise<Influencer[]> {
  const results: Influencer[] = [];
  const perPlatform = Math.ceil(limit / params.platforms.length);

  const platformFetchers: Record<Platform, (p: SearchParams, n: number) => Promise<Influencer[]>> = {
    youtube: searchYouTubeInfluencers,
    twitter: searchTwitterInfluencers,
    instagram: async (p, n) => generateMockInfluencers({ ...p, platforms: ['instagram'] }, n),
    tiktok: async (p, n) => generateMockInfluencers({ ...p, platforms: ['tiktok'] }, n),
    facebook: async (p, n) => generateMockInfluencers({ ...p, platforms: ['facebook'] }, n),
  };

  await Promise.all(
    params.platforms.map(async (platform) => {
      const fetcher = platformFetchers[platform];
      const influencers = await fetcher(params, perPlatform);
      results.push(...influencers);
    })
  );

  return results.slice(0, limit);
}
