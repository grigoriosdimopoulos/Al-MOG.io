import type { Influencer, RankedInfluencer, SearchParams } from '../../types';
import { getSettings } from '../../storage';
import { rankWithAnthropic } from './anthropic';
import { rankWithLocal, initLocalModel, isModelLoaded } from './local';

export { initLocalModel, isModelLoaded };

export async function rankInfluencers(
  candidates: Influencer[],
  params: SearchParams,
): Promise<RankedInfluencer[]> {
  const settings = await getSettings();

  if (settings.aiMode === 'anthropic') {
    if (!settings.anthropicApiKey.trim()) {
      throw new Error('Anthropic API key not set. Add it in Settings → AI Configuration.');
    }
    return rankWithAnthropic(settings.anthropicApiKey, params, candidates);
  }

  if (settings.aiMode === 'local') {
    if (!settings.localModelPath) {
      throw new Error('No local model selected. Go to Settings → Local Models to download one.');
    }
    if (!isModelLoaded()) {
      await initLocalModel(settings.localModelPath);
    }
    return rankWithLocal(params, candidates);
  }

  throw new Error('Unknown AI mode in settings.');
}
