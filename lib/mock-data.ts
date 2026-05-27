import { Influencer, Platform, SearchParams } from '@/types/influencer';

const PLATFORM_CONFIGS: Record<Platform, { minFollowers: number; maxFollowers: number }> = {
  instagram: { minFollowers: 10000, maxFollowers: 5000000 },
  twitter: { minFollowers: 5000, maxFollowers: 2000000 },
  youtube: { minFollowers: 20000, maxFollowers: 10000000 },
  tiktok: { minFollowers: 50000, maxFollowers: 8000000 },
  facebook: { minFollowers: 15000, maxFollowers: 3000000 },
};

const POLITICAL_TOPIC_POOL = [
  'healthcare', 'economy', 'immigration', 'climate change', 'education',
  'taxes', 'foreign policy', 'gun control', 'social justice', 'infrastructure',
  'veterans affairs', 'housing', 'criminal justice', 'energy policy', 'trade',
  'cybersecurity', 'national security', 'election reform', 'civil rights', 'labor rights',
];

const NAMES = [
  ['James', 'Richardson'], ['Maria', 'Santos'], ['David', 'Chen'], ['Sarah', 'Williams'],
  ['Marcus', 'Johnson'], ['Elena', 'Rodriguez'], ['Robert', 'Kim'], ['Amanda', 'Taylor'],
  ['Christopher', 'Brown'], ['Jessica', 'Davis'], ['Michael', 'Martinez'], ['Lauren', 'Wilson'],
  ['Daniel', 'Anderson'], ['Nicole', 'Thomas'], ['Kevin', 'Jackson'], ['Rachel', 'White'],
  ['Brandon', 'Harris'], ['Stephanie', 'Lewis'], ['Tyler', 'Clark'], ['Megan', 'Lee'],
  ['Alex', 'Patel'], ['Diana', 'Murphy'], ['Jordan', 'Rivera'], ['Brittany', 'Cook'],
  ['Nathan', 'Morgan'], ['Vanessa', 'Bell'], ['Aaron', 'Ward'], ['Michelle', 'Torres'],
  ['Gregory', 'Nguyen'], ['Ashley', 'Hill'], ['Patrick', 'Scott'], ['Samantha', 'Green'],
];

const LOCATIONS = [
  'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
  'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'Miami, FL',
  'Atlanta, GA', 'Boston, MA', 'Seattle, WA', 'Denver, CO', 'Detroit, MI',
  'Nashville, TN', 'Portland, OR', 'Las Vegas, NV', 'Memphis, TN', 'Baltimore, MD',
];

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function pickFromArray<T>(arr: T[], seed: number): T {
  return arr[Math.floor(seededRandom(seed) * arr.length)];
}

function generateBio(name: string, topics: string[], platform: Platform, keywords: string[]): string {
  const keywordStr = keywords.slice(0, 2).join(' & ');
  const topicStr = topics.slice(0, 2).join(', ');
  const bios = [
    `${name} | Political commentator focused on ${topicStr}. Covering ${keywordStr} and civic engagement since 2018.`,
    `Advocating for change on ${topicStr}. ${name}'s takes on ${keywordStr} — follow for daily updates.`,
    `Political analyst & ${platform} creator. Passionate about ${topicStr} and community organizing.`,
    `${name} | Grassroots organizer. Fighting for ${topicStr}. Views on ${keywordStr} every week.`,
    `Independent voice on ${topicStr}. Former campaign staffer. Now sharing insights on ${keywordStr}.`,
  ];
  return bios[Math.floor(Math.abs(Math.sin(name.length * 7)) * bios.length)];
}

export function generateMockInfluencers(params: SearchParams, count: number = 30): Influencer[] {
  const influencers: Influencer[] = [];
  const platforms = params.platforms.length > 0 ? params.platforms : ['twitter', 'instagram', 'youtube'] as Platform[];

  for (let i = 0; i < count; i++) {
    const seed = i * 137 + params.keywords.join('').length * 17;
    const platform = platforms[i % platforms.length];
    const config = PLATFORM_CONFIGS[platform];
    const nameArr = NAMES[i % NAMES.length];
    const displayName = `${nameArr[0]} ${nameArr[1]}`;
    const username = `${nameArr[0].toLowerCase()}${nameArr[1].toLowerCase()}${Math.floor(seededRandom(seed + 1) * 99)}`;

    const followerRange = params.followerMax - params.followerMin;
    const baseFollowers = params.followerMin + Math.floor(seededRandom(seed + 2) * followerRange);
    const followers = Math.max(config.minFollowers, Math.min(config.maxFollowers, baseFollowers > 0 ? baseFollowers : config.minFollowers + Math.floor(seededRandom(seed + 2) * (config.maxFollowers - config.minFollowers))));

    const engagementRate = parseFloat((params.engagementMin + seededRandom(seed + 3) * (8 - params.engagementMin)).toFixed(2));
    const avgLikes = Math.floor(followers * (engagementRate / 100) * 0.8);
    const avgComments = Math.floor(avgLikes * 0.05);

    const numTopics = 2 + Math.floor(seededRandom(seed + 4) * 3);
    const relevantTopics = params.politicalTopics.length > 0
      ? [...params.politicalTopics, ...POLITICAL_TOPIC_POOL].slice(0, numTopics)
      : POLITICAL_TOPIC_POOL.slice(Math.floor(seededRandom(seed + 5) * 10), Math.floor(seededRandom(seed + 5) * 10) + numTopics);

    const location = params.location
      ? params.location
      : pickFromArray(LOCATIONS, seed + 6);

    influencers.push({
      id: `mock-${platform}-${i}-${seed}`,
      platform,
      username,
      displayName,
      followers,
      following: Math.floor(followers * 0.1 + seededRandom(seed + 7) * 1000),
      engagementRate,
      avgLikes,
      avgComments,
      politicalTopics: relevantTopics,
      location,
      language: params.language || 'English',
      bio: generateBio(displayName, relevantTopics, platform, params.keywords),
      profileImageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      verifiedAccount: seededRandom(seed + 8) > 0.7,
      postsPerWeek: 2 + Math.floor(seededRandom(seed + 9) * 10),
    });
  }

  return influencers;
}
