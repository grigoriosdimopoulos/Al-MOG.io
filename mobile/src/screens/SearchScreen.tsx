import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, PLATFORM_LABELS, PLATFORM_ICONS, s } from '../theme';
import { fetchCandidates } from '../services/platforms';
import { rankInfluencers } from '../services/ai';
import { getSettings, saveToHistory } from '../storage';
import type { RootStackParamList, SearchParams, Platform as PlatformType, SearchRecord } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const ALL_PLATFORMS: PlatformType[] = ['instagram', 'twitter', 'youtube', 'tiktok', 'facebook'];
const TOPIC_PRESETS = [
  'Healthcare', 'Economy', 'Climate', 'Education', 'Immigration',
  'Foreign Policy', 'Tax Reform', 'Public Safety', 'Housing', 'Veterans',
  'Gun Rights', 'Civil Rights', 'Defense', 'Trade', 'Energy',
];
const LANGUAGES = ['en', 'es', 'fr', 'de', 'pt', 'ar', 'zh', 'hi'];

export default function SearchScreen() {
  const nav = useNavigation<Nav>();
  const [keywords, setKeywords] = useState<string[]>([]);
  const [kwInput, setKwInput] = useState('');
  const [platforms, setPlatforms] = useState<PlatformType[]>(['twitter', 'youtube']);
  const [location, setLocation] = useState('');
  const [followerMin, setFollowerMin] = useState('10000');
  const [followerMax, setFollowerMax] = useState('5000000');
  const [engagementMin, setEngagementMin] = useState('1');
  const [language, setLanguage] = useState('en');
  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');

  function addKeyword() {
    const kw = kwInput.trim();
    if (kw && !keywords.includes(kw)) setKeywords(p => [...p, kw]);
    setKwInput('');
  }

  function togglePlatform(p: PlatformType) {
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  }

  function toggleTopic(t: string) {
    setTopics(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  }

  async function runSearch() {
    if (keywords.length === 0) {
      Alert.alert('Keywords required', 'Add at least one keyword.');
      return;
    }
    if (platforms.length === 0) {
      Alert.alert('Platform required', 'Select at least one platform.');
      return;
    }

    const settings = await getSettings();
    const params: SearchParams = {
      keywords,
      location: location.trim(),
      platforms,
      followerMin: parseInt(followerMin, 10) || 10000,
      followerMax: parseInt(followerMax, 10) || 5_000_000,
      engagementMin: parseFloat(engagementMin) || 1,
      language,
      politicalTopics: topics,
    };

    setLoading(true);
    const t0 = Date.now();
    try {
      setLoadingStep('Gathering profiles from platforms…');
      const candidates = await fetchCandidates(params);

      const aiLabel = settings.aiMode === 'anthropic' ? 'Claude AI' : 'Local LLM';
      setLoadingStep(`Analyzing ${candidates.length} profiles with ${aiLabel}…`);
      const results = await rankInfluencers(candidates, params);

      const record: SearchRecord = {
        id: `s_${Date.now()}`,
        params,
        results,
        timestamp: Date.now(),
        aiMode: settings.aiMode,
        durationMs: Date.now() - t0,
      };
      await saveToHistory(record);
      nav.navigate('Results', { record });
    } catch (err: any) {
      Alert.alert('Search failed', err.message ?? 'Unknown error. Check Settings.');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.root} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Keywords */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search Keywords</Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="e.g. healthcare reform"
              placeholderTextColor={colors.textDim}
              value={kwInput}
              onChangeText={setKwInput}
              onSubmitEditing={addKeyword}
              returnKeyType="done"
            />
            <TouchableOpacity onPress={addKeyword} style={styles.addBtn}>
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
          {keywords.length > 0 && (
            <View style={styles.chipRow}>
              {keywords.map(kw => (
                <TouchableOpacity key={kw} onPress={() => setKeywords(p => p.filter(k => k !== kw))} style={styles.kwChip}>
                  <Text style={styles.kwChipText}>{kw} ✕</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Platforms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Platforms</Text>
          <View style={styles.chipRow}>
            {ALL_PLATFORMS.map(p => {
              const active = platforms.includes(p);
              return (
                <TouchableOpacity
                  key={p}
                  onPress={() => togglePlatform(p)}
                  style={[styles.platformBtn, active && styles.platformBtnOn]}
                >
                  <Text style={styles.platformIcon}>{PLATFORM_ICONS[p]}</Text>
                  <Text style={[styles.platformBtnText, active && { color: colors.gold, fontWeight: '700' }]}>
                    {PLATFORM_LABELS[p]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Filters */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Filters</Text>
          <View style={styles.grid2}>
            {[
              { label: 'Min followers', val: followerMin, set: setFollowerMin, num: true },
              { label: 'Max followers', val: followerMax, set: setFollowerMax, num: true },
              { label: 'Min engagement %', val: engagementMin, set: setEngagementMin, num: true },
              { label: 'Location', val: location, set: setLocation, num: false },
            ].map(({ label, val, set, num }) => (
              <View key={label} style={styles.filterItem}>
                <Text style={styles.filterLabel}>{label}</Text>
                <TextInput
                  style={styles.input}
                  keyboardType={num ? 'decimal-pad' : 'default'}
                  value={val}
                  onChangeText={set}
                  placeholderTextColor={colors.textDim}
                  placeholder={num ? '0' : 'Any'}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Language */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language</Text>
          <View style={styles.chipRow}>
            {LANGUAGES.map(l => (
              <TouchableOpacity
                key={l}
                onPress={() => setLanguage(l)}
                style={[styles.langBtn, language === l && styles.langBtnOn]}
              >
                <Text style={[styles.langBtnText, language === l && { color: colors.gold }]}>{l.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Topics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Political Topics</Text>
          <View style={styles.chipRow}>
            {TOPIC_PRESETS.map(t => {
              const active = topics.includes(t);
              return (
                <TouchableOpacity
                  key={t}
                  onPress={() => toggleTopic(t)}
                  style={[styles.topicBtn, active && styles.topicBtnOn]}
                >
                  <Text style={[styles.topicBtnText, active && { color: colors.gold, fontWeight: '600' }]}>{t}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Run */}
        <TouchableOpacity onPress={runSearch} style={[styles.searchBtn, loading && { opacity: 0.7 }]} disabled={loading}>
          {loading ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <ActivityIndicator color={colors.bg} size="small" />
              <Text style={styles.searchBtnText} numberOfLines={1}>{loadingStep || 'Analyzing…'}</Text>
            </View>
          ) : (
            <Text style={styles.searchBtnText}>Search & Analyze</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40 },
  section: { marginBottom: 22 },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: colors.gold,
    letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10,
  },
  row: { flexDirection: 'row', gap: 8 },
  input: {
    backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.border,
    borderRadius: 8, color: colors.text, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14,
  },
  addBtn: {
    backgroundColor: colors.gold, borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center',
  },
  addBtnText: { color: colors.bg, fontWeight: '700', fontSize: 14 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  kwChip: {
    backgroundColor: colors.bgInput, borderRadius: 6, paddingHorizontal: 10,
    paddingVertical: 5, borderWidth: 1, borderColor: colors.gold,
  },
  kwChipText: { color: colors.gold, fontSize: 13, fontWeight: '600' },
  platformBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgCard,
  },
  platformBtnOn: { borderColor: colors.gold, backgroundColor: colors.bgInput },
  platformIcon: { fontSize: 14 },
  platformBtnText: { fontSize: 13, color: colors.textMuted },
  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  filterItem: { width: '47%' },
  filterLabel: { fontSize: 11, color: colors.textMuted, marginBottom: 4 },
  langBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgCard,
  },
  langBtnOn: { borderColor: colors.gold, backgroundColor: colors.bgInput },
  langBtnText: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  topicBtn: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgCard,
  },
  topicBtnOn: { borderColor: colors.gold, backgroundColor: colors.bgInput },
  topicBtnText: { fontSize: 12, color: colors.textMuted },
  searchBtn: {
    backgroundColor: colors.gold, borderRadius: 10,
    paddingVertical: 16, alignItems: 'center', marginTop: 4,
  },
  searchBtnText: { fontSize: 16, fontWeight: '800', color: colors.bg },
});
