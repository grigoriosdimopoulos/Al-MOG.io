export type Platform = 'instagram' | 'twitter' | 'youtube' | 'tiktok' | 'facebook';

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
  following: number;
  engagementRate: number;
  avgLikes: number;
  avgComments: number;
  politicalTopics: string[];
  location: string;
  language: string;
  bio: string;
  profileImageUrl: string;
  verifiedAccount: boolean;
  postsPerWeek: number;
}

export interface RankedInfluencer extends Influencer {
  relevanceScore: number;
  aiSummary: string;
  reachEstimate: number;
  tier: 'high' | 'medium' | 'low';
}

export type UserTier = 'free' | 'paid';

export interface SearchResult {
  influencers: RankedInfluencer[];
  totalFound: number;
  tier: UserTier;
  searchId: string;
}
