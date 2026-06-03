export type Platform = 'instagram' | 'twitter' | 'youtube' | 'tiktok' | 'facebook';
export type AIMode = 'anthropic' | 'local';
export type SortKey = 'score' | 'followers' | 'engagement';
export type TierFilter = 'all' | 'high' | 'medium' | 'low';

export interface SearchParams {
  keywords: string[];
  location: string;
  platforms: Platform[];
  followerMin: number;
  followerMax: number;
  engagementMin: number;
  language: string;
  politicalTopics: string[];
}

export interface Influencer {
  id: string;
  platform: Platform;
  username: string;
  displayName: string;
  followers: number;
  engagementRate: number;
  avgLikes: number;
  avgComments: number;
  politicalTopics: string[];
  location: string;
  language: string;
  bio: string;
  profileImageUrl: string;
  verifiedAccount: boolean;
}

export interface RankedInfluencer extends Influencer {
  relevanceScore: number;
  aiSummary: string;
  reachEstimate: number;
  tier: 'high' | 'medium' | 'low';
}

export interface SearchRecord {
  id: string;
  params: SearchParams;
  results: RankedInfluencer[];
  timestamp: number;
  aiMode: AIMode;
  durationMs: number;
}

export interface AppSettings {
  aiMode: AIMode;
  anthropicApiKey: string;
  localModelPath: string | null;
  localModelName: string | null;
  youtubeApiKey: string;
  twitterBearerToken: string;
  resultsPerSearch: number;
}

export interface LocalModel {
  name: string;
  filename: string;
  sizeGB: number;
  url: string;
  description: string;
}

export type RootStackParamList = {
  MainTabs: undefined;
  Results: { record: SearchRecord };
  Detail: { influencer: RankedInfluencer };
  ModelManager: undefined;
};

export type TabParamList = {
  Search: undefined;
  Bookmarks: undefined;
  History: undefined;
  Settings: undefined;
};
