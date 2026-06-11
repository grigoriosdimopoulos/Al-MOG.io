import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppSettings, RankedInfluencer, SearchRecord } from './types';

const KEYS = {
  SETTINGS: 'aimog:settings',
  BOOKMARKS: 'aimog:bookmarks',
  HISTORY: 'aimog:history',
};

export const DEFAULT_SETTINGS: AppSettings = {
  aiMode: 'anthropic',
  anthropicApiKey: '',
  localModelPath: null,
  localModelName: null,
  youtubeApiKey: '',
  twitterBearerToken: '',
  googleApiKey: '',
  googleCseId: '',
  serpApiKey: '',
  resultsPerSearch: 30,
};

export async function getSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

export async function getBookmarks(): Promise<RankedInfluencer[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.BOOKMARKS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function toggleBookmark(influencer: RankedInfluencer): Promise<boolean> {
  const bookmarks = await getBookmarks();
  const idx = bookmarks.findIndex(b => b.id === influencer.id);
  if (idx >= 0) {
    const updated = [...bookmarks.slice(0, idx), ...bookmarks.slice(idx + 1)];
    await AsyncStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(updated));
    return false;
  } else {
    await AsyncStorage.setItem(KEYS.BOOKMARKS, JSON.stringify([influencer, ...bookmarks]));
    return true;
  }
}

export async function isBookmarked(id: string): Promise<boolean> {
  const bookmarks = await getBookmarks();
  return bookmarks.some(b => b.id === id);
}

export async function getHistory(): Promise<SearchRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveToHistory(record: SearchRecord): Promise<void> {
  const history = await getHistory();
  const trimmed = [record, ...history].slice(0, 50);
  await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(trimmed));
}

export async function deleteHistoryRecord(id: string): Promise<void> {
  const history = await getHistory();
  await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(history.filter(r => r.id !== id)));
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.HISTORY);
}
