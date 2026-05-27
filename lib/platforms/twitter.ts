import { Influencer, SearchParams } from '@/types/influencer';
import { generateMockInfluencers } from '@/lib/mock-data';

export async function searchTwitterInfluencers(params: SearchParams, limit: number): Promise<Influencer[]> {
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;

  if (!bearerToken) {
    return generateMockInfluencers({ ...params, platforms: ['twitter'] }, limit);
  }

  // Twitter API v2 - search for users by keyword in bio
  // GET https://api.twitter.com/2/users/search?query={q}&max_results={n}&user.fields=...
  const query = [...params.keywords, ...params.politicalTopics].join(' OR ');
  const fields = 'public_metrics,description,location,verified,profile_image_url';
  const url = `https://api.twitter.com/2/users/search?query=${encodeURIComponent(query)}&max_results=${Math.min(limit, 100)}&user.fields=${fields}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${bearerToken}` },
  });

  if (!res.ok) {
    return generateMockInfluencers({ ...params, platforms: ['twitter'] }, limit);
  }

  const data = await res.json() as {
    data: Array<{
      id: string;
      name: string;
      username: string;
      description: string;
      location: string;
      verified: boolean;
      profile_image_url: string;
      public_metrics: { followers_count: number; following_count: number; tweet_count: number; like_count: number };
    }>;
  };

  return (data.data || []).map((user) => ({
    id: `tw-${user.id}`,
    platform: 'twitter' as const,
    username: user.username,
    displayName: user.name,
    followers: user.public_metrics.followers_count,
    following: user.public_metrics.following_count,
    engagementRate: parseFloat(((user.public_metrics.like_count / Math.max(1, user.public_metrics.tweet_count * user.public_metrics.followers_count)) * 100).toFixed(2)),
    avgLikes: Math.floor(user.public_metrics.like_count / Math.max(1, user.public_metrics.tweet_count)),
    avgComments: 0,
    politicalTopics: params.politicalTopics,
    location: user.location || params.location,
    language: params.language || 'English',
    bio: user.description,
    profileImageUrl: user.profile_image_url,
    verifiedAccount: user.verified,
    postsPerWeek: Math.floor(user.public_metrics.tweet_count / 52),
  }));
}
