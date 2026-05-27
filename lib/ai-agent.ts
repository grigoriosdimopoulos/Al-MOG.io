import Groq from 'groq-sdk';
import { Influencer, RankedInfluencer, SearchParams } from '@/types/influencer';

let _groq: Groq | null = null;
function getGroq(): Groq {
  if (!_groq) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not set. Copy .env.local.example to .env.local and add your free key from console.groq.com');
    }
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groq;
}

const SYSTEM_PROMPT = `You are a Political Campaign Intelligence Analyst AI. Your job is to analyze social media influencer profiles and rank them by their potential to help a political candidate win an election.

You evaluate each influencer on:
1. Keyword & topic relevance (does their content align with the campaign's focus areas?)
2. Audience reach & engagement quality (high engagement rate signals genuine influence)
3. Geographic alignment (local/regional reach matters for elections)
4. Credibility signals (verified accounts, consistent posting, longevity)
5. Political topic overlap (how closely do their stated interests match campaign issues?)

For each influencer, assign a relevanceScore from 0-100:
- 85-100: Exceptional fit — highly aligned, massive reach, strong engagement
- 70-84: Strong fit — very relevant topics, solid metrics
- 50-69: Moderate fit — some alignment, decent reach
- Below 50: Low fit — minimal relevance to this campaign

Return ONLY valid JSON matching this exact schema:
{
  "rankedInfluencers": [
    {
      "id": "string",
      "relevanceScore": number,
      "aiSummary": "2-3 sentence explanation of why this influencer matters for this specific campaign",
      "reachEstimate": number,
      "tier": "high" | "medium" | "low"
    }
  ]
}`;

function buildUserPrompt(params: SearchParams, candidates: Influencer[]): string {
  return `CAMPAIGN SEARCH PARAMETERS:
- Keywords: ${params.keywords.join(', ')}
- Target Location: ${params.location || 'National'}
- Political Topics: ${params.politicalTopics.join(', ') || 'General politics'}
- Language: ${params.language || 'English'}
- Min Followers: ${params.followerMin.toLocaleString()}
- Min Engagement Rate: ${params.engagementMin}%

CANDIDATE INFLUENCERS TO ANALYZE (${candidates.length} profiles):
${candidates.map((inf, i) => `
[${i + 1}] ID: ${inf.id}
  Platform: ${inf.platform} | Username: @${inf.username} | Name: ${inf.displayName}
  Followers: ${inf.followers.toLocaleString()} | Engagement: ${inf.engagementRate}% | Verified: ${inf.verifiedAccount}
  Location: ${inf.location} | Language: ${inf.language}
  Political Topics: ${inf.politicalTopics.join(', ')}
  Bio: ${inf.bio}
  Posts/week: ${inf.postsPerWeek}
`).join('\n')}

Analyze all ${candidates.length} influencers and return the ranked JSON. Every influencer must appear in the output.`;
}

export async function rankInfluencers(
  params: SearchParams,
  candidates: Influencer[]
): Promise<RankedInfluencer[]> {
  if (candidates.length === 0) return [];

  const completion = await getGroq().chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(params, candidates) },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
    max_tokens: 4096,
  });

  const raw = completion.choices[0]?.message?.content || '{}';
  const parsed = JSON.parse(raw) as {
    rankedInfluencers: Array<{
      id: string;
      relevanceScore: number;
      aiSummary: string;
      reachEstimate: number;
      tier: 'high' | 'medium' | 'low';
    }>;
  };

  const scoreMap = new Map(parsed.rankedInfluencers.map((r) => [r.id, r]));

  return candidates
    .map((inf) => {
      const ranked = scoreMap.get(inf.id);
      return {
        ...inf,
        relevanceScore: ranked?.relevanceScore ?? 50,
        aiSummary: ranked?.aiSummary ?? 'This influencer has potential relevance to your campaign.',
        reachEstimate: ranked?.reachEstimate ?? Math.floor(inf.followers * 0.3),
        tier: ranked?.tier ?? 'medium',
      };
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}
