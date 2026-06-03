import type { Influencer, RankedInfluencer, SearchParams } from '../../types';

// Lazy-loaded to avoid crash if native module not linked in dev builds
let _context: any = null;

export async function initLocalModel(modelPath: string): Promise<void> {
  const { initLlama } = require('llama.rn');
  if (_context) {
    await _context.release();
    _context = null;
  }
  _context = await initLlama({
    model: modelPath,
    use_mlock: true,
    n_ctx: 2048,
    n_threads: 4,
    n_gpu_layers: 0,
  });
}

export function isModelLoaded(): boolean {
  return _context !== null;
}

export async function releaseModel(): Promise<void> {
  if (_context) {
    await _context.release();
    _context = null;
  }
}

export async function rankWithLocal(
  params: SearchParams,
  candidates: Influencer[],
): Promise<RankedInfluencer[]> {
  if (!_context) throw new Error('No local model loaded. Select one in Settings → Local Models.');

  const BATCH = 5;
  const ranked: RankedInfluencer[] = [];

  for (let i = 0; i < candidates.length; i += BATCH) {
    const batch = candidates.slice(i, i + BATCH);
    const prompt = buildPrompt(params, batch);

    const result = await _context.completion({
      prompt,
      n_predict: 600,
      temperature: 0.1,
      stop: ['</s>', 'Human:', 'User:', '\n\nUser'],
    });

    try {
      const m = result.text.match(/\{[\s\S]*?\}/);
      if (!m) throw new Error('no json');
      const parsed = JSON.parse(m[0]);
      if (Array.isArray(parsed.ranked)) {
        ranked.push(...merge(batch, parsed.ranked));
        continue;
      }
    } catch {
      // fallback scoring
    }

    ranked.push(
      ...batch.map(c => ({
        ...c,
        relevanceScore: 45,
        aiSummary: 'Analyzed locally — insufficient context for detailed summary.',
        reachEstimate: Math.floor(c.followers * 0.55),
        tier: 'medium' as const,
      })),
    );
  }

  return ranked.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

function buildPrompt(params: SearchParams, batch: Influencer[]): string {
  const campaignCtx = [
    `keywords: ${params.keywords.join(', ')}`,
    `location: ${params.location || 'nationwide'}`,
    `topics: ${params.politicalTopics.join(', ') || 'politics'}`,
  ].join(' | ');

  const profiles = batch
    .map(
      c =>
        `id=${c.id} platform=${c.platform} followers=${c.followers} engagement=${c.engagementRate}% topics=[${c.politicalTopics.slice(0, 3).join(',')}] bio="${c.bio.slice(0, 100)}"`,
    )
    .join('\n');

  return `<s>[INST] You are a political campaign analyst. Rank these influencers for relevance.

Campaign: ${campaignCtx}

Profiles:
${profiles}

Return ONLY valid JSON with no other text:
{"ranked":[{"id":"...","relevanceScore":0,"aiSummary":"...","reachEstimate":0,"tier":"high|medium|low"}]} [/INST]`;
}

function merge(
  candidates: Influencer[],
  rankings: Array<{ id: string; relevanceScore: number; aiSummary: string; reachEstimate: number; tier: 'high' | 'medium' | 'low' }>,
): RankedInfluencer[] {
  const map = new Map(rankings.map(r => [r.id, r]));
  return candidates.map(c => {
    const r = map.get(c.id);
    return {
      ...c,
      relevanceScore: r?.relevanceScore ?? 40,
      aiSummary: r?.aiSummary ?? 'Local analysis.',
      reachEstimate: r?.reachEstimate ?? Math.floor(c.followers * 0.55),
      tier: r?.tier ?? 'low',
    };
  });
}
