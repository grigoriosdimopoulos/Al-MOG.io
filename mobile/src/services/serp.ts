import type { Influencer, Platform } from '../types';
import { buildQuery, resultsToInfluencers, type RawResult } from './searchCommon';

// SerpAPI client — paid alternative to Google Custom Search.
// Free tier: 100 searches/month. Docs: https://serpapi.com/search-api

const SERP_URL = 'https://serpapi.com/search';

export async function searchSerpAPI(
  apiKey: string,
  keywords: string[],
  location: string,
  language: string,
  platform: Platform,
  topics: string[],
): Promise<Influencer[]> {
  const query = buildQuery(keywords, location, language, platform);

  const params = new URLSearchParams({
    engine: 'google',
    q: query,
    api_key: apiKey,
    num: '10',
    hl: language === 'el' ? 'el' : 'en',
    gl: location.toLowerCase().includes('greece') || location.toLowerCase().includes('ελλάδα') || language === 'el' ? 'gr' : 'us',
  });

  const resp = await fetch(`${SERP_URL}?${params}`);
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`SerpAPI ${resp.status}: ${body.slice(0, 150)}`);
  }

  const data = await resp.json();
  if (data.error) throw new Error(`SerpAPI: ${data.error}`);

  const organicResults: any[] = data.organic_results ?? [];
  const raw: RawResult[] = organicResults.map(item => ({
    link: item.link ?? '',
    title: item.title ?? '',
    snippet: item.snippet ?? '',
    thumbnail: item.thumbnail ?? '',
  }));

  return resultsToInfluencers(raw, platform, location, language, topics);
}
