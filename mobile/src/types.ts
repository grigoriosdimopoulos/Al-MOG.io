export type AccountType = 'personal' | 'organization' | 'media' | 'party' | 'ngo';
export type ContentType = 'posts' | 'video' | 'reels' | 'live' | 'podcasts';
export type PoliticalSpectrum = 'all' | 'left' | 'center-left' | 'center' | 'center-right' | 'right';
export type DateRange = 'any' | '7d' | '30d' | '90d' | '1y';

export interface SearchParams {
  keywords: string[];
  location: string;
  regions: string[];
  platforms: Platform[];
  followerMin: number;
  followerMax: number;
  engagementMin: number;
  language: string;
  politicalTopics: string[];
  accountTypes: AccountType[];
  contentTypes: ContentType[];
  verifiedOnly: boolean;
  bioKeywords: string[];
  excludeKeywords: string[];
  politicalSpectrum: PoliticalSpectrum;
  dateRange: DateRange;
  minPostsPerMonth: number;
}

export interface Influencer {
  id: string;
  platform: Platform;
  username: string;
  displayName: string;
  profileUrl: string;
  dataSource: 'real' | 'estimated' | 'mock';
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
  scoringReason: string;
  reachEstimate: number;
  tier: 'high' | 'medium' | 'low';
}

export interface NetworkEdge {
  fromId: string;
  toId: string;
  connectionType: string;
  strength: 'strong' | 'moderate' | 'weak';
  description: string;
  confidence: number;
}

export interface NetworkAnalysis {
  id: string;
  influencers: RankedInfluencer[];
  edges: NetworkEdge[];
  summary: string;
  keyInsights: string[];
  timestamp: number;
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
  googleApiKey: string;
  googleCseId: string;
  serpApiKey: string;
  resultsPerSearch: number;
}

export interface LocalModel {
  name: string;
  filename: string;
  sizeGB: number;
  url: string;
  description: string;
}

export type Platform = 'instagram' | 'twitter' | 'youtube' | 'tiktok' | 'facebook';
export type AIMode = 'anthropic' | 'local';
export type SortKey = 'score' | 'followers' | 'engagement';
export type TierFilter = 'all' | 'high' | 'medium' | 'low';

export type RootStackParamList = {
  MainTabs: undefined;
  Results: { record: SearchRecord };
  Detail: { influencer: RankedInfluencer };
  ModelManager: undefined;
  NetworkAnalysis: { influencers: RankedInfluencer[] };
};

export type TabParamList = {
  Search: undefined;
  Bookmarks: undefined;
  History: undefined;
  Settings: undefined;
};
