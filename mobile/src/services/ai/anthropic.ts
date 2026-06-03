import type { Influencer, RankedInfluencer, SearchParams } from '../../types';

const API_URL = 'https://api.anthropic.com/v1/messages';

export async function rankWithAnthropic(
  apiKey: string,
  params: SearchParams,
  candidates: Influencer[],
): Promise<RankedInfluencer[]> {
  const system = `You are a Political Campaign Intelligence Analyst specializing in social media influence mapping. You analyze influencer profiles and rank them by their strategic value to political campaigns. Respond ONLY with valid JSON — no prose, no markdown, no explanation outside the JSON structure.`;

  const user = `Campaign parameters:
- Keywords: ${params.keywords.join(', ')}
- Target location: ${params.location || 'nationwide'}
- Political topics: ${params.politicalTopics.join(', ') || 'general politics'}
- Language: ${params.language || 'en'}
- Follower range: ${params.followerMin.toLocaleString()}–${params.followerMax.toLocaleString()}
- Min engagement: ${params.engagementMin}%

Rank these ${candidates.length} influencer candidates by strategic value. For each:
- relevanceScore (0–100): fit for the campaign
- aiSummary: 1–2 sentences explaining WHY this person is strategically valuable
- reachEstimate: realistic unique audience reach estimate (not just followers)
- tier: "high" (≥75), "medium" (≥50), "low" (<50)

Return ONLY this JSON:
{"ranked":[{"id":"string","relevanceScore":0,"aiSummary":"string","reachEstimate":0,"tier":"high|medium|low"}]}

Candidates:
${JSON.stringify(
  candidates.map(c => ({
    id: c.id,
    platform: c.platform,
    username: c.username,
    followers: c.followers,
    engagementRate: c.engagementRate,
    politicalTopics: c.politicalTopics,
    location: c.location,
    bio: c.bio.slice(0, 180),
  })),
)}`;

  const resp = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 8192,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });

  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Anthropic API ${resp.status}: ${body.slice(0, 200)}`);
  }

  const data = await resp.json();
  const text: string = data.content?.[0]?.text ?? '{}';

  let parsed: { ranked: Array<{ id: string; relevanceScore: number; aiSummary: string; reachEstimate: number; tier: 'high' | 'medium' | 'low' }> };
  try {
    const match = text.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(match ? match[0] : text);
  } catch {
    throw new Error('Anthropic returned unparseable JSON. Try again.');
  }

  return merge(candidates, parsed.ranked ?? []);
}

function merge(
  candidates: Influencer[],
  rankings: Array<{ id: string; relevanceScore: number; aiSummary: string; reachEstimate: number; tier: 'high' | 'medium' | 'low' }>,
): RankedInfluencer[] {
  const map = new Map(rankings.map(r => [r.id, r]));
  return candidates
    .map(c => {
      const r = map.get(c.id);
      return {
        ...c,
        relevanceScore: r?.relevanceScore ?? 40,
        aiSummary: r?.aiSummary ?? 'No analysis generated.',
        reachEstimate: r?.reachEstimate ?? Math.floor(c.followers * 0.6),
        tier: r?.tier ?? 'low',
      };
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}
