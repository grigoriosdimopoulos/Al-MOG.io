import { Influencer, SearchParams } from '@/types/influencer';
import { generateMockInfluencers } from '@/lib/mock-data';

export async function searchYouTubeInfluencers(params: SearchParams, limit: number): Promise<Influencer[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    const mocks = generateMockInfluencers({ ...params, platforms: ['youtube'] }, limit);
    return mocks;
  }

  // Real YouTube Data API v3 integration
  // GET https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q={keywords}&maxResults={limit}&key={apiKey}
  // Then GET /youtube/v3/channels?part=statistics,snippet&id={channelIds}&key={apiKey}
  const query = [...params.keywords, ...params.politicalTopics].join(' ');
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&maxResults=${limit}&key=${apiKey}`;

  const searchRes = await fetch(searchUrl);
  if (!searchRes.ok) {
    return generateMockInfluencers({ ...params, platforms: ['youtube'] }, limit);
  }

  const searchData = await searchRes.json() as {
    items: Array<{ id: { channelId: string }; snippet: { title: string; description: string; thumbnails: { default: { url: string } } } }>;
  };
  const channelIds = searchData.items.map((item) => item.id.channelId).join(',');

  const statsUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${channelIds}&key=${apiKey}`;
  const statsRes = await fetch(statsUrl);
  if (!statsRes.ok) {
    return generateMockInfluencers({ ...params, platforms: ['youtube'] }, limit);
  }

  const statsData = await statsRes.json() as {
    items: Array<{
      id: string;
      snippet: { title: string; description: string; customUrl: string; country: string; thumbnails: { default: { url: string } } };
      statistics: { subscriberCount: string; videoCount: string; viewCount: string };
    }>;
  };

  return statsData.items.map((channel) => ({
    id: `yt-${channel.id}`,
    platform: 'youtube' as const,
    username: channel.snippet.customUrl?.replace('@', '') || channel.id,
    displayName: channel.snippet.title,
    followers: parseInt(channel.statistics.subscriberCount || '0', 10),
    following: 0,
    engagementRate: parseFloat(((parseInt(channel.statistics.viewCount, 10) / Math.max(1, parseInt(channel.statistics.subscriberCount, 10))) * 0.01).toFixed(2)),
    avgLikes: 0,
    avgComments: 0,
    politicalTopics: params.politicalTopics,
    location: channel.snippet.country || params.location,
    language: params.language || 'English',
    bio: channel.snippet.description.slice(0, 200),
    profileImageUrl: channel.snippet.thumbnails.default.url,
    verifiedAccount: false,
    postsPerWeek: Math.floor(parseInt(channel.statistics.videoCount, 10) / 52),
  }));
}
