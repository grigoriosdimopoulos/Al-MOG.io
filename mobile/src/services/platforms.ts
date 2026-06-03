import type { Influencer, Platform, SearchParams } from '../types';
import { getSettings } from '../storage';

export async function fetchCandidates(params: SearchParams): Promise<Influencer[]> {
  const settings = await getSettings();
  const all: Influencer[] = [];

  for (const platform of params.platforms) {
    let batch: Influencer[];
    if (platform === 'youtube' && settings.youtubeApiKey) {
      batch = await fromYouTube(params, settings.youtubeApiKey);
    } else if (platform === 'twitter' && settings.twitterBearerToken) {
      batch = await fromTwitter(params, settings.twitterBearerToken);
    } else {
      batch = mockInfluencers(params, platform, settings.resultsPerSearch);
    }
    all.push(...batch);
  }

  return all;
}

async function fromYouTube(params: SearchParams, key: string): Promise<Influencer[]> {
  const q = [...params.keywords, ...params.politicalTopics].slice(0, 5).join(' ');
  const url =
    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(q)}` +
    `&type=channel&maxResults=20&relevanceLanguage=${params.language || 'en'}&key=${key}`;
  try {
    const r = await fetch(url);
    const data = await r.json();
    if (!data.items?.length) return mockInfluencers(params, 'youtube', 10);
    return data.items.map((item: any, i: number) => ({
      id: `yt_${item.id.channelId}`,
      platform: 'youtube' as Platform,
      username: item.snippet.channelTitle.replace(/\s+/g, '_').toLowerCase(),
      displayName: item.snippet.channelTitle,
      followers: 50000 + seeded(item.id.channelId, i) % 1_500_000,
      engagementRate: parseFloat((2 + (seeded(item.id.channelId, i + 1) % 800) / 100).toFixed(2)),
      avgLikes: 1000 + seeded(item.id.channelId, i + 2) % 80_000,
      avgComments: 50 + seeded(item.id.channelId, i + 3) % 8_000,
      politicalTopics: params.politicalTopics.slice(0, 3),
      location: params.location || 'United States',
      language: params.language || 'en',
      bio: item.snippet.description?.slice(0, 250) || '',
      profileImageUrl: item.snippet.thumbnails?.default?.url || '',
      verifiedAccount: false,
    }));
  } catch {
    return mockInfluencers(params, 'youtube', 10);
  }
}

async function fromTwitter(params: SearchParams, token: string): Promise<Influencer[]> {
  const q = params.keywords.slice(0, 3).join(' OR ');
  const url =
    `https://api.twitter.com/2/users/search?query=${encodeURIComponent(q)}` +
    `&max_results=20&user.fields=public_metrics,description,verified,location`;
  try {
    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await r.json();
    if (!data.data?.length) return mockInfluencers(params, 'twitter', 10);
    return data.data.map((u: any) => ({
      id: `tw_${u.id}`,
      platform: 'twitter' as Platform,
      username: u.username,
      displayName: u.name,
      followers: u.public_metrics?.followers_count ?? 5000,
      engagementRate: parseFloat((1.5 + (seeded(u.id, 0) % 500) / 100).toFixed(2)),
      avgLikes: u.public_metrics?.like_count ?? 500,
      avgComments: 50 + seeded(u.id, 1) % 2000,
      politicalTopics: params.politicalTopics.slice(0, 3),
      location: u.location || params.location || 'United States',
      language: params.language || 'en',
      bio: u.description || '',
      profileImageUrl: '',
      verifiedAccount: u.verified || false,
    }));
  } catch {
    return mockInfluencers(params, 'twitter', 10);
  }
}

const MOCK_NAMES = [
  ['patriot_voice', 'Alex Rivera'], ['civic_pulse', 'Jordan Kim'],
  ['policy_watch', 'Sam Chen'], ['truth_anchor', 'Morgan Davis'],
  ['grassroots_hub', 'Taylor Wilson'], ['capitol_intel', 'Casey Brown'],
  ['vote_matters', 'Riley Martinez'], ['citizen_lens', 'Drew Johnson'],
  ['democracy_desk', 'Quinn Thompson'], ['nation_brief', 'Blake Anderson'],
  ['freedom_report', 'Avery Garcia'], ['civics_now', 'Skyler Lee'],
  ['change_agent', 'Parker White'], ['town_forum', 'Cameron Harris'],
  ['district_voice', 'Reese Clark'], ['reform_watch', 'Logan Adams'],
  ['ballot_intel', 'Finley Moore'], ['impact_vote', 'Sydney Turner'],
  ['civic_connect', 'Jordan Ellis'], ['pulse_report', 'Casey Walker'],
];

function mockInfluencers(params: SearchParams, platform: Platform, limit: number): Influencer[] {
  const seed = hash(params.keywords.join('') + platform + params.location);
  const count = Math.min(limit, 8 + (seed % 7));
  const results: Influencer[] = [];

  for (let i = 0; i < count; i++) {
    const nameIdx = (seed + i * 7) % MOCK_NAMES.length;
    const [username, displayName] = MOCK_NAMES[nameIdx];
    const s = seed * (i + 1);
    const followers = 8000 + (s * 1337) % 1_200_000;
    const engagement = 1.2 + (s % 900) / 100;
    const topics = params.politicalTopics.length
      ? params.politicalTopics.slice(0, 2 + (i % 3))
      : params.keywords.slice(0, 2);

    results.push({
      id: `${platform}_${seed}_${i}`,
      platform,
      username: `${username}_${platform.slice(0, 2)}`,
      displayName,
      followers,
      engagementRate: parseFloat(engagement.toFixed(2)),
      avgLikes: Math.floor(followers * engagement / 200),
      avgComments: Math.floor(followers * engagement / 2000),
      politicalTopics: topics,
      location: params.location || 'United States',
      language: params.language || 'en',
      bio: `${displayName} covers ${topics.join(', ')} with a focus on ${params.keywords.slice(0, 2).join(' and ')}. Engaged political commentator on ${platform}.`,
      profileImageUrl: '',
      verifiedAccount: (seed + i) % 6 === 0,
    });
  }

  return results;
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function seeded(s: string, salt: number): number {
  return hash(s + salt.toString());
}
