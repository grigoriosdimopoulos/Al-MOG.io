import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { RankedInfluencer, SearchParams } from '../types';

function slug(params: SearchParams): string {
  return (params.keywords[0] ?? 'search').replace(/\s+/g, '_').toLowerCase();
}

export async function exportCSV(results: RankedInfluencer[], params: SearchParams): Promise<void> {
  const header = [
    'Rank', 'Score', 'Tier', 'Platform', 'Username', 'Display Name',
    'Followers', 'Engagement %', 'Avg Likes', 'Avg Comments',
    'Reach Est.', 'Location', 'Topics', 'AI Summary',
  ].join(',');

  const rows = results.map((r, i) =>
    [
      i + 1,
      r.relevanceScore,
      r.tier,
      r.platform,
      r.username,
      `"${r.displayName}"`,
      r.followers,
      r.engagementRate.toFixed(2),
      r.avgLikes,
      r.avgComments,
      r.reachEstimate,
      `"${r.location}"`,
      `"${r.politicalTopics.join('; ')}"`,
      `"${r.aiSummary.replace(/"/g, "'")}"`,
    ].join(','),
  );

  const csv = [header, ...rows].join('\n');
  const path = `${FileSystem.documentDirectory}aimog_${slug(params)}_${Date.now()}.csv`;
  await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });
  await Sharing.shareAsync(path, { mimeType: 'text/csv', dialogTitle: 'Export results as CSV' });
}

export async function exportJSON(results: RankedInfluencer[], params: SearchParams): Promise<void> {
  const payload = { exportedAt: new Date().toISOString(), searchParams: params, results };
  const path = `${FileSystem.documentDirectory}aimog_${slug(params)}_${Date.now()}.json`;
  await FileSystem.writeAsStringAsync(path, JSON.stringify(payload, null, 2), {
    encoding: FileSystem.EncodingType.UTF8,
  });
  await Sharing.shareAsync(path, { mimeType: 'application/json', dialogTitle: 'Export results as JSON' });
}
