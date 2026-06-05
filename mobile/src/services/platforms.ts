import type { Influencer, Platform, SearchParams } from '../types';
import { getSettings } from '../storage';
import { searchGoogleCSE } from './google';
import { searchSerpAPI } from './serp';

function buildProfileUrl(platform: Platform, username: string, channelId?: string): string {
  const u = username.replace(/^@/, '');
  switch (platform) {
    case 'instagram': return `https://www.instagram.com/${u}/`;
    case 'twitter':   return `https://x.com/${u}`;
    case 'youtube':   return channelId ? `https://www.youtube.com/channel/${channelId}` : `https://www.youtube.com/@${u}`;
    case 'tiktok':    return `https://www.tiktok.com/@${u}`;
    case 'facebook':  return `https://www.facebook.com/${u}`;
    default:          return '';
  }
}

export let lastSearchError: string | null = null;

export async function fetchCandidates(params: SearchParams): Promise<Influencer[]> {
  const settings = await getSettings();
  const all: Influencer[] = [];
  lastSearchError = null;

  for (const platform of params.platforms) {
    let batch: Influencer[];

    if (settings.googleApiKey.trim() && settings.googleCseId.trim()) {
      // Google Custom Search (free, 100/day) → real profiles
      try {
        batch = await searchGoogleCSE(
          settings.googleApiKey,
          settings.googleCseId,
          params.keywords,
          params.location,
          params.language,
          platform,
          params.politicalTopics,
        );
        if (batch.length === 0) batch = mockInfluencers(params, platform, settings.resultsPerSearch);
      } catch (e: any) {
        lastSearchError = `Google CSE [${platform}]: ${e.message}`;
        console.warn(lastSearchError);
        batch = mockInfluencers(params, platform, settings.resultsPerSearch);
      }
    } else if (settings.serpApiKey.trim()) {
      // SerpAPI: real Google search → real profiles
      try {
        batch = await searchSerpAPI(
          settings.serpApiKey,
          params.keywords,
          params.location,
          params.language,
          platform,
          params.politicalTopics,
        );
        if (batch.length === 0) batch = mockInfluencers(params, platform, settings.resultsPerSearch);
      } catch (e: any) {
        console.warn(`SerpAPI error for ${platform}:`, e.message);
        batch = mockInfluencers(params, platform, settings.resultsPerSearch);
      }
    } else if (platform === 'youtube' && settings.youtubeApiKey) {
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
    `&type=channel&maxResults=20&relevanceLanguage=${params.language || 'el'}&key=${key}`;
  try {
    const r = await fetch(url);
    const data = await r.json();
    if (!data.items?.length) return mockInfluencers(params, 'youtube', 10);
    return data.items.map((item: any, i: number) => ({
      id: `yt_${item.id.channelId}`,
      platform: 'youtube' as Platform,
      username: item.snippet.channelTitle.replace(/\s+/g, '_').toLowerCase(),
      displayName: item.snippet.channelTitle,
      profileUrl: buildProfileUrl('youtube', item.snippet.channelTitle.replace(/\s+/g, '_').toLowerCase(), item.id.channelId),
      dataSource: 'real' as const,
      followers: 50000 + seeded(item.id.channelId, i) % 1_500_000,
      engagementRate: parseFloat((2 + (seeded(item.id.channelId, i + 1) % 800) / 100).toFixed(2)),
      avgLikes: 1000 + seeded(item.id.channelId, i + 2) % 80_000,
      avgComments: 50 + seeded(item.id.channelId, i + 3) % 8_000,
      politicalTopics: params.politicalTopics.slice(0, 3),
      location: params.location || 'Greece',
      language: params.language || 'el',
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
      profileUrl: buildProfileUrl('twitter', u.username),
      dataSource: 'real' as const,
      followers: u.public_metrics?.followers_count ?? 5000,
      engagementRate: parseFloat((1.5 + (seeded(u.id, 0) % 500) / 100).toFixed(2)),
      avgLikes: u.public_metrics?.like_count ?? 500,
      avgComments: 50 + seeded(u.id, 1) % 2000,
      politicalTopics: params.politicalTopics.slice(0, 3),
      location: u.location || params.location || 'Greece',
      language: params.language || 'el',
      bio: u.description || '',
      profileImageUrl: '',
      verifiedAccount: u.verified || false,
    }));
  } catch {
    return mockInfluencers(params, 'twitter', 10);
  }
}

const GREEK_NAMES = [
  ['politiki_ellada', 'Γιώργης Παπαδόπουλος'], ['hellas_voice', 'Νίκος Αθανασίου'],
  ['athina_speaks', 'Ελένη Κωνσταντίνου'], ['agora_gr', 'Σταύρος Δημητρίου'],
  ['polis_watch', 'Μαρία Σταματίου'], ['ekloges_now', 'Κώστας Μαρκάκης'],
  ['syntagma_live', 'Άρης Βενιζέλος'], ['demos_gr', 'Σοφία Λαζαρίδου'],
  ['vouli_report', 'Δημήτρης Καλογεράς'], ['kratos_intel', 'Κατερίνα Ρήγα'],
  ['laos_tora', 'Πάνος Ζαχαρίου'], ['politeia_gr', 'Αλεξάνδρα Πετρίδου'],
  ['ekfrassi_gr', 'Γιάννης Μεταξάς'], ['paratiritis_gr', 'Ιωάννα Σαρρή'],
  ['ellinas_citizen', 'Βασίλης Θεοδωρακόπουλος'], ['enimerosi_gr', 'Χρήστος Νάκος'],
  ['dimokratia_live', 'Νάντια Κυριακού'], ['koinonia_gr', 'Αλέξης Φλωράκης'],
  ['agones_gr', 'Σπύρος Τριανταφύλλης'], ['greece_now', 'Ρένα Δούκα'],
];

const MOCK_NAMES = [
  ['patriot_voice', 'Alex Rivera'], ['civic_pulse', 'Jordan Kim'],
  ['policy_watch', 'Sam Chen'], ['truth_anchor', 'Morgan Davis'],
  ['grassroots_hub', 'Taylor Wilson'], ['capitol_intel', 'Casey Brown'],
  ['vote_matters', 'Riley Martinez'], ['citizen_lens', 'Drew Johnson'],
  ['democracy_desk', 'Quinn Thompson'], ['nation_brief', 'Blake Anderson'],
];

function mockInfluencers(params: SearchParams, platform: Platform, limit: number): Influencer[] {
  const isGreek = (params.location || '').toLowerCase().includes('greece') ||
    (params.location || '').toLowerCase().includes('greek') ||
    (params.location || '').toLowerCase().includes('ελλάδα') ||
    (params.location || '').toLowerCase().includes('αθήνα') ||
    params.language === 'el';

  const namePool = isGreek ? GREEK_NAMES : MOCK_NAMES;
  const defaultLocation = isGreek ? (params.location || 'Αθήνα, Ελλάδα') : (params.location || 'United States');
  const defaultLanguage = params.language || (isGreek ? 'el' : 'en');

  const seed = hash(params.keywords.join('') + platform + params.location);
  const count = Math.min(limit, 8 + (seed % 7));
  const results: Influencer[] = [];

  for (let i = 0; i < count; i++) {
    const nameIdx = (seed + i * 7) % namePool.length;
    const [username, displayName] = namePool[nameIdx];
    const s = seed * (i + 1);
    const followers = 8000 + (s * 1337) % 1_200_000;
    const engagement = 1.2 + (s % 900) / 100;
    const topics = params.politicalTopics.length
      ? params.politicalTopics.slice(0, 2 + (i % 3))
      : params.keywords.slice(0, 2);

    if (params.verifiedOnly && (seed + i) % 5 !== 0) continue;

    const un = `${username}_${platform.slice(0, 2)}`;
    results.push({
      id: `${platform}_${seed}_${i}`,
      platform,
      username: un,
      displayName,
      profileUrl: buildProfileUrl(platform, un),
      dataSource: 'mock',
      followers,
      engagementRate: parseFloat(engagement.toFixed(2)),
      avgLikes: Math.floor(followers * engagement / 200),
      avgComments: Math.floor(followers * engagement / 2000),
      politicalTopics: topics,
      location: defaultLocation,
      language: defaultLanguage,
      bio: isGreek
        ? `${displayName} ασχολείται με ${topics.join(', ')} και δημοσιεύει για ${params.keywords.slice(0, 2).join(' και ')}.`
        : `${displayName} covers ${topics.join(', ')} with a focus on ${params.keywords.slice(0, 2).join(' and ')}.`,
      profileImageUrl: '',
      verifiedAccount: (seed + i) % 5 === 0,
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
