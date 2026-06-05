import type { Influencer, Platform } from '../types';
import { buildQuery, resultsToInfluencers, type RawResult } from './searchCommon';

// Google Custom Search JSON API — the free option.
// Free tier: 100 queries/day (vs SerpAPI's 100/month).
//
// Requires TWO credentials:
//   1. apiKey  — Google Cloud API key with "Custom Search API" enabled
//   2. cseId   — a Programmable Search Engine ID (cx), configured to
//                "Search the entire web" at programmablesearchengine.google.com
//
// Docs: https://developers.google.com/custom-search/v1/overview

const CSE_URL = 'https://www.googleapis.com/customsearch/v1';

export async function searchGoogleCSE(
  apiKey: string,
  cseId: string,
  keywords: string[],
  location: string,
  language: string,
  platform: Platform,
  topics: string[],
): Promise<Influencer[]> {
  const query = buildQuery(keywords, location, language, platform);

  const params = new URLSearchParams({
    key: apiKey,
    cx: cseId,
    q: query,
    num: '10', // max allowed per request
    hl: language === 'el' ? 'el' : 'en',
    gl: location.toLowerCase().includes('greece') || location.toLowerCase().includes('ελλάδα') || language === 'el' ? 'gr' : 'us',
  });

  const resp = await fetch(`${CSE_URL}?${params}`);
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Google CSE ${resp.status}: ${body.slice(0, 150)}`);
  }

  const data = await resp.json();
  if (data.error) throw new Error(`Google CSE: ${data.error.message ?? 'unknown error'}`);

  const items: any[] = data.items ?? [];
  const raw: RawResult[] = items.map(item => ({
    link: item.link ?? '',
    title: item.title ?? '',
    snippet: item.snippet ?? '',
    thumbnail:
      item.pagemap?.cse_thumbnail?.[0]?.src ??
      item.pagemap?.cse_image?.[0]?.src ??
      '',
  }));

  return resultsToInfluencers(raw, platform, location, language, topics);
}
