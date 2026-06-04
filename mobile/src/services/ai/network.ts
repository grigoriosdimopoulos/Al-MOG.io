import type { RankedInfluencer, NetworkAnalysis, NetworkEdge } from '../../types';

const API_URL = 'https://api.anthropic.com/v1/messages';

export async function analyzeNetwork(
  apiKey: string,
  influencers: RankedInfluencer[],
): Promise<NetworkAnalysis> {
  const system = `You are a political intelligence analyst specializing in social network mapping and relationship inference. Given influencer profiles, identify all plausible connections, relationships, and network ties. Be thorough — consider political, professional, geographic, ideological, and social dimensions. Respond ONLY with valid JSON.`;

  const profiles = influencers.map(inf => ({
    id: inf.id,
    name: inf.displayName,
    platform: inf.platform,
    location: inf.location,
    topics: inf.politicalTopics,
    bio: inf.bio.slice(0, 300),
    followers: inf.followers,
    engagementRate: inf.engagementRate,
    verified: inf.verifiedAccount,
    language: inf.language,
  }));

  const user = `Analyze the network connections between these ${influencers.length} political influencers.

For every PAIR of influencers, identify ALL plausible connections:
- Direct social connections (follow each other, mention each other, collaborate)
- Shared political positions or party affiliations
- Geographic proximity or shared community
- Professional/business overlaps (same industry, organizations, employers)
- Shared audience demographics
- Ideological alignment or opposition
- Potential mutual contacts (friend-of-friend networks)
- Media/organizational ties
- Historical interactions (events, campaigns, coalitions)
- Shared funding sources or backers
- Common causes or movements

Profiles:
${JSON.stringify(profiles, null, 2)}

Return ONLY this JSON (no prose outside):
{
  "summary": "2-3 sentence overview of the network structure",
  "keyInsights": ["insight 1", "insight 2", "insight 3", "insight 4", "insight 5"],
  "edges": [
    {
      "fromId": "id1",
      "toId": "id2",
      "connectionType": "type (e.g. 'Political Allies', 'Geographic Proximity', 'Shared Audience', 'Ideological Alignment', 'Professional Network', 'Party Affiliation', 'Media Colleagues', 'Campaign Collaboration', 'Opposition', 'Mutual Followers')",
      "strength": "strong|moderate|weak",
      "description": "Specific explanation of this connection and its implications",
      "confidence": 0
    }
  ]
}`;

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

  let parsed: { summary: string; keyInsights: string[]; edges: NetworkEdge[] };
  try {
    const match = text.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(match ? match[0] : text);
  } catch {
    throw new Error('Αδύνατη η ανάλυση αποτελέσματος AI. Δοκιμάστε ξανά.');
  }

  return {
    id: `net_${Date.now()}`,
    influencers,
    edges: parsed.edges ?? [],
    summary: parsed.summary ?? 'Η ανάλυση ολοκληρώθηκε.',
    keyInsights: parsed.keyInsights ?? [],
    timestamp: Date.now(),
  };
}

export async function analyzeNetworkLocal(
  influencers: RankedInfluencer[],
): Promise<NetworkAnalysis> {
  // Deterministic inference without AI — based on shared topics, location, platform
  const edges: NetworkEdge[] = [];

  for (let i = 0; i < influencers.length; i++) {
    for (let j = i + 1; j < influencers.length; j++) {
      const a = influencers[i];
      const b = influencers[j];

      const sharedTopics = a.politicalTopics.filter(t => b.politicalTopics.includes(t));
      const sameLocation = a.location === b.location ||
        (a.location && b.location && a.location.split(',')[0] === b.location.split(',')[0]);
      const samePlatform = a.platform === b.platform;
      const sameLanguage = a.language === b.language;

      if (sharedTopics.length > 0) {
        edges.push({
          fromId: a.id,
          toId: b.id,
          connectionType: 'Κοινά Πολιτικά Θέματα',
          strength: sharedTopics.length >= 3 ? 'strong' : sharedTopics.length >= 2 ? 'moderate' : 'weak',
          description: `Κοινά θέματα: ${sharedTopics.join(', ')}.`,
          confidence: Math.min(90, 50 + sharedTopics.length * 15),
        });
      }

      if (sameLocation) {
        edges.push({
          fromId: a.id,
          toId: b.id,
          connectionType: 'Γεωγραφική Εγγύτητα',
          strength: 'moderate',
          description: `Και οι δύο βρίσκονται στην ίδια περιοχή: ${a.location}.`,
          confidence: 70,
        });
      }

      if (samePlatform && sameLanguage) {
        edges.push({
          fromId: a.id,
          toId: b.id,
          connectionType: 'Κοινό Κοινό',
          strength: 'weak',
          description: `Ενεργοί στην ίδια πλατφόρμα (${a.platform}) με κοινή γλώσσα.`,
          confidence: 55,
        });
      }
    }
  }

  const totalConnections = edges.length;
  return {
    id: `net_${Date.now()}`,
    influencers,
    edges,
    summary: `Εντοπίστηκαν ${totalConnections} πιθανές συνδέσεις μεταξύ ${influencers.length} επιρροών. Η ανάλυση βασίζεται σε κοινά θέματα, γεωγραφία και πλατφόρμα.`,
    keyInsights: [
      `${influencers.length} επιρροές αναλύθηκαν`,
      `${totalConnections} πιθανές συνδέσεις εντοπίστηκαν`,
      edges.filter(e => e.strength === 'strong').length + ' ισχυρές συνδέσεις',
    ],
    timestamp: Date.now(),
  };
}
