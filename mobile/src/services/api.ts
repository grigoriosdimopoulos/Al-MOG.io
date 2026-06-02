import { SearchParams, SearchResult } from '../types';

// Android emulator localhost = 10.0.2.2; set EXPO_PUBLIC_API_URL for real deployments
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3000';

export async function searchInfluencers(params: SearchParams): Promise<SearchResult> {
  const res = await fetch(`${API_URL}/api/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json() as SearchResult & { error?: string; code?: string };

  if (!res.ok) {
    throw new Error(data.error ?? 'Search failed');
  }

  return data;
}
