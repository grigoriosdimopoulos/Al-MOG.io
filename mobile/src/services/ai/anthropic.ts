import type { Influencer, RankedInfluencer, SearchParams } from '../../types';

const API_URL = 'https://api.anthropic.com/v1/messages';

export async function rankWithAnthropic(
  apiKey: string,
  params: SearchParams,
  candidates: Influencer[],
): Promise<RankedInfluencer[]> {
  const system = `You are a Political Campaign Intelligence Analyst specializing in social media influence mapping for Greek and international political campaigns. Analyze influencer profiles and rank them by strategic value. Respond ONLY with valid JSON — no prose, no markdown outside the JSON structure.`;

  const extra = [
    params.verifiedOnly ? '- Verified accounts only' : '',
    params.accountTypes?.length ? `- Account types: ${params.accountTypes.join(', ')}` : '',
    params.contentTypes?.length ? `- Content types: ${params.contentTypes.join(', ')}` : '',
    params.bioKeywords?.length ? `- Bio keywords required: ${params.bioKeywords.join(', ')}` : '',
    params.excludeKeywords?.length ? `- Exclude if bio/topics contain: ${params.excludeKeywords.join(', ')}` : '',
    params.politicalSpectrum && params.politicalSpectrum !== 'all' ? `- Political spectrum: ${params.politicalSpectrum}` : '',
    params.dateRange && params.dateRange !== 'any' ? `- Content recency: last ${params.dateRange}` : '',
  ].filter(Boolean).join('\n');

  const user = `Campaign parameters:
- Keywords: ${params.keywords.join(', ')}
- Target location: ${params.location || 'Greece'}
- Regions: ${params.regions?.join(', ') || 'nationwide'}
- Political topics: ${params.politicalTopics.join(', ') || 'general politics'}
- Language: ${params.language || 'el'}
- Follower range: ${params.followerMin.toLocaleString()}–${params.followerMax.toLocaleString()}
- Min engagement: ${params.engagementMin}%${extra ? '\n' + extra : ''}

Rank these ${candidates.length} influencer candidates. For each provide:
- relevanceScore (0–100): strategic fit for this campaign
- aiSummary: 2–3 sentences on strategic value and audience fit
- scoringReason: detailed breakdown of WHY this exact score — what drove it up or limited it (mention specific factors: topic alignment, engagement quality, audience size, location match, political positioning, bio keywords, etc.)
- reachEstimate: realistic unique audience reach (not just followers)
- tier: "high" (≥75), "medium" (≥50), "low" (<50)

Return ONLY this JSON:
{"ranked":[{"id":"string","relevanceScore":0,"aiSummary":"string","scoringReason":"string","reachEstimate":0,"tier":"high|medium|low"}]}

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
    language: c.language,
    verifiedAccount: c.verifiedAccount,
    bio: c.bio.slice(0, 200),
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

  let parsed: {
    ranked: Array<{
      id: string;
      relevanceScore: number;
      aiSummary: string;
      scoringReason: string;
      reachEstimate: number;
      tier: 'high' | 'medium' | 'low';
    }>;
  };
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
  rankings: Array<{
    id: string;
    relevanceScore: number;
    aiSummary: string;
    scoringReason: string;
    reachEstimate: number;
    tier: 'high' | 'medium' | 'low';
  }>,
): RankedInfluencer[] {
  const map = new Map(rankings.map(r => [r.id, r]));
  return candidates
    .map(c => {
      const r = map.get(c.id);
      const score = r?.relevanceScore ?? 40;
      return {
        ...c,
        relevanceScore: score,
        aiSummary: r?.aiSummary ?? 'Δεν παράχθηκε ανάλυση.',
        scoringReason: r?.scoringReason ?? `Προεπιλεγμένη βαθμολογία ${score}/100.`,
        reachEstimate: r?.reachEstimate ?? Math.floor(c.followers * 0.6),
        tier: r?.tier ?? (score >= 75 ? 'high' : score >= 50 ? 'medium' : 'low'),
      };
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}
