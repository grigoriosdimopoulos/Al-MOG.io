import type { Influencer, RankedInfluencer, SearchParams } from '../../types';
import * as FileSystem from 'expo-file-system';

let _context: any = null;

export async function initLocalModel(modelPath: string): Promise<void> {
  // Verify file exists before attempting to load
  const info = await FileSystem.getInfoAsync(modelPath);
  if (!info.exists) {
    throw new Error(`Model file not found: ${modelPath}\nGo to Settings → Manage Models and re-download it.`);
  }

  // Release any existing context first
  if (_context) {
    try { await _context.release(); } catch {}
    _context = null;
  }

  const { initLlama } = require('llama.rn');
  _context = await initLlama({
    model: modelPath,
    use_mlock: false,   // true can OOM/crash on Android
    n_ctx: 1024,        // 2048 is too large for most phones
    n_threads: 2,       // conservative — prevents ANR on single-core load
    n_gpu_layers: 0,
    n_batch: 128,
  });
}

export function isModelLoaded(): boolean {
  return _context !== null;
}

export async function releaseModel(): Promise<void> {
  if (_context) {
    try { await _context.release(); } catch {}
    _context = null;
  }
}

export async function rankWithLocal(
  params: SearchParams,
  candidates: Influencer[],
): Promise<RankedInfluencer[]> {
  if (!_context) {
    throw new Error('Δεν έχει φορτωθεί μοντέλο. Επιλέξτε ένα στις Ρυθμίσεις → Μοντέλα.');
  }

  const BATCH = 3; // smaller batches to stay within n_ctx
  const ranked: RankedInfluencer[] = [];

  for (let i = 0; i < candidates.length; i += BATCH) {
    const batch = candidates.slice(i, i + BATCH);
    const prompt = buildPrompt(params, batch);

    try {
      const result = await _context.completion({
        prompt,
        n_predict: 512,
        temperature: 0.1,
        stop: ['</s>', 'Human:', 'User:', '\n\nUser', '[INST]'],
        repeat_penalty: 1.1,
      });

      const m = (result.text as string).match(/\{[\s\S]*\}/);
      if (m) {
        const parsed = JSON.parse(m[0]);
        if (Array.isArray(parsed.ranked)) {
          ranked.push(...mergeRankings(batch, parsed.ranked));
          continue;
        }
      }
    } catch (e: any) {
      // model returned garbage or timed out — use fallback scores
      console.warn('Local LLM batch error:', e?.message ?? e);
    }

    // Fallback: deterministic scoring based on topic match
    ranked.push(...batch.map(c => fallback(c, params)));
  }

  return ranked.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

function fallback(c: Influencer, params: SearchParams): RankedInfluencer {
  const topicMatch = c.politicalTopics.filter(t =>
    params.politicalTopics.includes(t) ||
    params.keywords.some(k => t.toLowerCase().includes(k.toLowerCase()))
  ).length;
  const score = Math.min(70, 35 + topicMatch * 10);
  return {
    ...c,
    relevanceScore: score,
    aiSummary: 'Τοπική ανάλυση — βαθμολογία βάσει ταύτισης θεμάτων.',
    scoringReason: `Βρέθηκαν ${topicMatch} κοινά θέματα με τα κριτήρια αναζήτησης. Followers: ${c.followers.toLocaleString()}, Engagement: ${c.engagementRate}%.`,
    reachEstimate: Math.floor(c.followers * 0.55),
    tier: score >= 65 ? 'high' : score >= 45 ? 'medium' : 'low',
  };
}

function buildPrompt(params: SearchParams, batch: Influencer[]): string {
  const ctx = `keywords=${params.keywords.join(',')} location=${params.location || 'Greece'} topics=${params.politicalTopics.slice(0, 3).join(',')}`;
  const profiles = batch
    .map(c => `id=${c.id} plat=${c.platform} followers=${c.followers} eng=${c.engagementRate}% topics=[${c.politicalTopics.slice(0, 2).join(',')}] bio="${c.bio.slice(0, 80)}"`)
    .join('\n');

  return `<s>[INST] Political campaign analyst. Score these influencers 0-100.

Campaign: ${ctx}
Profiles:
${profiles}

Return ONLY JSON:
{"ranked":[{"id":"...","relevanceScore":75,"aiSummary":"...","scoringReason":"...","reachEstimate":50000,"tier":"high"}]} [/INST]`;
}

function mergeRankings(
  candidates: Influencer[],
  rankings: Array<{
    id: string;
    relevanceScore: number;
    aiSummary: string;
    scoringReason?: string;
    reachEstimate: number;
    tier: 'high' | 'medium' | 'low';
  }>,
): RankedInfluencer[] {
  const map = new Map(rankings.map(r => [r.id, r]));
  return candidates.map(c => {
    const r = map.get(c.id);
    const score = r?.relevanceScore ?? 40;
    return {
      ...c,
      relevanceScore: score,
      aiSummary: r?.aiSummary ?? 'Τοπική ανάλυση.',
      scoringReason: r?.scoringReason ?? `Βαθμολογία ${score}/100 από τοπικό μοντέλο.`,
      reachEstimate: r?.reachEstimate ?? Math.floor(c.followers * 0.55),
      tier: r?.tier ?? (score >= 75 ? 'high' : score >= 50 ? 'medium' : 'low'),
    };
  });
}
