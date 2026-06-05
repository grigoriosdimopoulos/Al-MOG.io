import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, PLATFORM_LABELS, LANGUAGE_LABELS } from '../theme';
import { fetchCandidates, lastSearchError } from '../services/platforms';
import { rankInfluencers } from '../services/ai';
import { getSettings, saveToHistory } from '../storage';
import type {
  RootStackParamList, SearchParams,
  Platform as PlatformType, AccountType, ContentType,
  PoliticalSpectrum, DateRange, SearchRecord,
} from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const ALL_PLATFORMS: PlatformType[] = ['instagram', 'twitter', 'youtube', 'tiktok', 'facebook'];

const PLATFORM_SHORT: Record<PlatformType, string> = {
  instagram: 'Instagram',
  twitter: 'X / Twitter',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  facebook: 'Facebook',
};

const LANGUAGES = ['el', 'en', 'de', 'fr', 'it', 'es', 'tr', 'ar'];

const LOCATION_PRESETS = [
  { label: 'Αθήνα', value: 'Athens, Greece' },
  { label: 'Θεσσαλονίκη', value: 'Thessaloniki, Greece' },
  { label: 'Κρήτη', value: 'Crete, Greece' },
  { label: 'Πάτρα', value: 'Patras, Greece' },
  { label: 'Μακεδονία', value: 'Macedonia, Greece' },
  { label: 'Νησιά', value: 'Greek Islands' },
  { label: 'Ελλάδα', value: 'Greece' },
  { label: 'Κύπρος', value: 'Cyprus' },
];

const GREEK_TOPICS = [
  'Οικονομία', 'Μετανάστευση', 'Παιδεία', 'Υγεία', 'Ε.Ε. / Ευρωζώνη',
  'Τουρισμός', 'Ναυτιλία', 'Άμυνα', 'Δικαιοσύνη', 'Περιβάλλον',
];

const TOPIC_PRESETS = [
  'Economy', 'Healthcare', 'Climate', 'Education', 'Immigration',
  'Foreign Policy', 'Tax Reform', 'Public Safety', 'Housing', 'Defense',
  'Civil Rights', 'Trade', 'Energy', 'EU Affairs', 'Tourism',
];

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  personal: 'Personal',
  organization: 'Organization',
  media: 'Media Outlet',
  party: 'Political Party',
  ngo: 'NGO',
};

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  posts: 'Posts',
  video: 'Video',
  reels: 'Reels',
  live: 'Live',
  podcasts: 'Podcasts',
};

const FOLLOWER_PRESETS = [
  { label: '1K+', min: 1_000, max: 50_000 },
  { label: '10K+', min: 10_000, max: 500_000 },
  { label: '100K+', min: 100_000, max: 2_000_000 },
  { label: '1M+', min: 1_000_000, max: 50_000_000 },
];

const SPECTRUM_OPTIONS: { label: string; value: PoliticalSpectrum }[] = [
  { label: 'Όλα', value: 'all' },
  { label: 'Αριστερά', value: 'left' },
  { label: 'Κεντρ. Αρ.', value: 'center-left' },
  { label: 'Κέντρο', value: 'center' },
  { label: 'Κεντρ. Δε.', value: 'center-right' },
  { label: 'Δεξιά', value: 'right' },
];

const DATE_RANGE_OPTIONS: { label: string; value: DateRange }[] = [
  { label: 'Οποιαδήποτε', value: 'any' },
  { label: '7 ημέρες', value: '7d' },
  { label: '30 ημέρες', value: '30d' },
  { label: '90 ημέρες', value: '90d' },
  { label: '1 χρόνος', value: '1y' },
];

export default function SearchScreen() {
  const nav = useNavigation<Nav>();

  // --- Keywords ---
  const [keywords, setKeywords] = useState<string[]>([]);
  const [kwInput, setKwInput] = useState('');
  const [bioKeywords, setBioKeywords] = useState<string[]>([]);
  const [bioInput, setBioInput] = useState('');

  // --- Platforms ---
  const [platforms, setPlatforms] = useState<PlatformType[]>(['twitter', 'youtube']);

  // --- Location ---
  const [location, setLocation] = useState('Greece');
  const [regions, setRegions] = useState<string[]>([]);

  // --- Audience filters ---
  const [followerMin, setFollowerMin] = useState('10000');
  const [followerMax, setFollowerMax] = useState('5000000');
  const [engagementMin, setEngagementMin] = useState('1');
  const [language, setLanguage] = useState('el');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // --- Content & account type ---
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);

  // --- Extra filters ---
  const [excludeKeywords, setExcludeKeywords] = useState<string[]>([]);
  const [excludeInput, setExcludeInput] = useState('');
  const [politicalSpectrum, setPoliticalSpectrum] = useState<PoliticalSpectrum>('all');
  const [dateRange, setDateRange] = useState<DateRange>('any');
  const [minPostsPerMonth, setMinPostsPerMonth] = useState('');

  // --- Topics ---
  const [topics, setTopics] = useState<string[]>([]);

  // --- State ---
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');

  // -- helpers --
  function addKw() {
    const kw = kwInput.trim();
    if (kw && !keywords.includes(kw)) setKeywords(p => [...p, kw]);
    setKwInput('');
  }

  function addBioKw() {
    const kw = bioInput.trim();
    if (kw && !bioKeywords.includes(kw)) setBioKeywords(p => [...p, kw]);
    setBioInput('');
  }

  function addExcludeKw() {
    const kw = excludeInput.trim();
    if (kw && !excludeKeywords.includes(kw)) setExcludeKeywords(p => [...p, kw]);
    setExcludeInput('');
  }

  function togglePlatform(p: PlatformType) {
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  }

  function toggleTopic(t: string) {
    setTopics(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  }

  function toggleAccountType(t: AccountType) {
    setAccountTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  }

  function toggleContentType(t: ContentType) {
    setContentTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  }

  function applyFollowerPreset(min: number, max: number) {
    setFollowerMin(min.toString());
    setFollowerMax(max.toString());
  }

  async function runSearch() {
    if (keywords.length === 0) {
      Alert.alert('Απαιτούνται λέξεις-κλειδιά', 'Προσθέστε τουλάχιστον μία λέξη-κλειδί.');
      return;
    }
    if (platforms.length === 0) {
      Alert.alert('Απαιτείται πλατφόρμα', 'Επιλέξτε τουλάχιστον μία πλατφόρμα.');
      return;
    }

    const settings = await getSettings();
    const params: SearchParams = {
      keywords,
      location: location.trim(),
      regions,
      platforms,
      followerMin: parseInt(followerMin, 10) || 10_000,
      followerMax: parseInt(followerMax, 10) || 5_000_000,
      engagementMin: parseFloat(engagementMin) || 1,
      language,
      politicalTopics: topics,
      accountTypes,
      contentTypes,
      verifiedOnly,
      bioKeywords,
      excludeKeywords,
      politicalSpectrum,
      dateRange,
      minPostsPerMonth: parseInt(minPostsPerMonth, 10) || 0,
    };

    setLoading(true);
    const t0 = Date.now();
    try {
      setLoadingStep('Συλλογή προφίλ από πλατφόρμες…');
      const candidates = await fetchCandidates(params);

      // Warn if real-profile search failed and fell back to mock
      if (lastSearchError) {
        Alert.alert(
          'Αποτυχία Google CSE',
          `Η αναζήτηση πραγματικών προφίλ απέτυχε — εμφανίζονται προσομοιωμένα δεδομένα.\n\nΣφάλμα: ${lastSearchError}\n\nΕλέγξτε τα κλειδιά API στις Ρυθμίσεις.`,
        );
      }

      const aiLabel = settings.aiMode === 'anthropic' ? 'Claude AI' : 'Local LLM';
      setLoadingStep(`Ανάλυση ${candidates.length} προφίλ με ${aiLabel}…`);
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
      Alert.alert('Αποτυχία αναζήτησης', err.message ?? 'Άγνωστο σφάλμα. Ελέγξτε τις ρυθμίσεις.');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.root} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* ── KEYWORDS ─────────────────────────────────── */}
        <SectionBlock title="Λέξεις-κλειδιά / Keywords">
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="π.χ. φορολογική μεταρρύθμιση"
              placeholderTextColor={colors.textDim}
              value={kwInput}
              onChangeText={setKwInput}
              onSubmitEditing={addKw}
              returnKeyType="done"
            />
            <TouchableOpacity onPress={addKw} style={styles.addBtn}>
              <Text style={styles.addBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          {keywords.length > 0 && (
            <View style={styles.chipRow}>
              {keywords.map(kw => (
                <TouchableOpacity key={kw} onPress={() => setKeywords(p => p.filter(k => k !== kw))} style={styles.kwChip}>
                  <Text style={styles.kwChipText}>{kw}  ×</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </SectionBlock>

        {/* ── LOCATION ─────────────────────────────────── */}
        <SectionBlock title="Γεωγραφική Περιοχή / Location">
          <TextInput
            style={styles.input}
            placeholder="Αθήνα, Θεσσαλονίκη, Greece…"
            placeholderTextColor={colors.textDim}
            value={location}
            onChangeText={setLocation}
          />
          <Text style={styles.fieldHint}>Γρήγορη επιλογή:</Text>
          <View style={styles.chipRow}>
            {LOCATION_PRESETS.map(({ label, value }) => (
              <TouchableOpacity
                key={value}
                onPress={() => setLocation(value)}
                style={[styles.preset, location === value && styles.presetOn]}
              >
                <Text style={[styles.presetText, location === value && styles.presetTextOn]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </SectionBlock>

        {/* ── PLATFORMS ────────────────────────────────── */}
        <SectionBlock title="Πλατφόρμες / Platforms">
          <View style={styles.chipRow}>
            {ALL_PLATFORMS.map(p => {
              const active = platforms.includes(p);
              return (
                <TouchableOpacity
                  key={p}
                  onPress={() => togglePlatform(p)}
                  style={[styles.platformBtn, active && styles.platformBtnOn]}
                >
                  <Text style={[styles.platformBtnText, active && styles.platformBtnTextOn]}>
                    {PLATFORM_SHORT[p]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </SectionBlock>

        {/* ── LANGUAGE ─────────────────────────────────── */}
        <SectionBlock title="Γλώσσα / Language">
          <View style={styles.chipRow}>
            {LANGUAGES.map(l => (
              <TouchableOpacity
                key={l}
                onPress={() => setLanguage(l)}
                style={[styles.langBtn, language === l && styles.langBtnOn]}
              >
                <Text style={styles.langCode}>{l.toUpperCase()}</Text>
                <Text style={[styles.langLabel, language === l && styles.langLabelOn]}>
                  {LANGUAGE_LABELS[l]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </SectionBlock>

        {/* ── AUDIENCE METRICS ─────────────────────────── */}
        <SectionBlock title="Μετρικές Κοινού / Audience">
          <Text style={styles.fieldHint}>Εύρος ακολούθων:</Text>
          <View style={styles.chipRow}>
            {FOLLOWER_PRESETS.map(({ label, min, max }) => {
              const active = followerMin === min.toString() && followerMax === max.toString();
              return (
                <TouchableOpacity
                  key={label}
                  onPress={() => applyFollowerPreset(min, max)}
                  style={[styles.preset, active && styles.presetOn]}
                >
                  <Text style={[styles.presetText, active && styles.presetTextOn]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.twoCol}>
            <View style={styles.colItem}>
              <Text style={styles.fieldLabel}>Ελάχιστοι</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={followerMin}
                onChangeText={setFollowerMin}
                placeholderTextColor={colors.textDim}
              />
            </View>
            <View style={styles.colItem}>
              <Text style={styles.fieldLabel}>Μέγιστοι</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={followerMax}
                onChangeText={setFollowerMax}
                placeholderTextColor={colors.textDim}
              />
            </View>
            <View style={styles.colItem}>
              <Text style={styles.fieldLabel}>Ελ. Engagement %</Text>
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                value={engagementMin}
                onChangeText={setEngagementMin}
                placeholderTextColor={colors.textDim}
              />
            </View>
          </View>

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Μόνο επαληθευμένοι λογαριασμοί</Text>
              <Text style={styles.fieldHint}>Verified accounts only</Text>
            </View>
            <Switch
              value={verifiedOnly}
              onValueChange={setVerifiedOnly}
              trackColor={{ false: colors.border, true: colors.blue }}
              thumbColor={verifiedOnly ? colors.blueLight : colors.textDim}
            />
          </View>
        </SectionBlock>

        {/* ── ACCOUNT TYPE ─────────────────────────────── */}
        <SectionBlock title="Τύπος Λογαριασμού / Account Type">
          <View style={styles.chipRow}>
            {(Object.keys(ACCOUNT_TYPE_LABELS) as AccountType[]).map(t => {
              const active = accountTypes.includes(t);
              return (
                <TouchableOpacity
                  key={t}
                  onPress={() => toggleAccountType(t)}
                  style={[styles.typeBtn, active && styles.typeBtnOn]}
                >
                  <Text style={[styles.typeBtnText, active && styles.typeBtnTextOn]}>
                    {ACCOUNT_TYPE_LABELS[t]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.fieldHint}>Αφήστε κενό για όλους τους τύπους</Text>
        </SectionBlock>

        {/* ── CONTENT TYPE ─────────────────────────────── */}
        <SectionBlock title="Τύπος Περιεχομένου / Content">
          <View style={styles.chipRow}>
            {(Object.keys(CONTENT_TYPE_LABELS) as ContentType[]).map(t => {
              const active = contentTypes.includes(t);
              return (
                <TouchableOpacity
                  key={t}
                  onPress={() => toggleContentType(t)}
                  style={[styles.typeBtn, active && styles.typeBtnOn]}
                >
                  <Text style={[styles.typeBtnText, active && styles.typeBtnTextOn]}>
                    {CONTENT_TYPE_LABELS[t]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </SectionBlock>

        {/* ── POLITICAL TOPICS ─────────────────────────── */}
        <SectionBlock title="Πολιτικά Θέματα / Topics">
          <Text style={styles.fieldHint}>Ελληνικά θέματα:</Text>
          <View style={styles.chipRow}>
            {GREEK_TOPICS.map(t => {
              const active = topics.includes(t);
              return (
                <TouchableOpacity key={t} onPress={() => toggleTopic(t)}
                  style={[styles.topicBtn, active && styles.topicBtnOn]}>
                  <Text style={[styles.topicBtnText, active && styles.topicBtnTextOn]}>{t}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.divider} />
          <Text style={styles.fieldHint}>Διεθνή θέματα:</Text>
          <View style={styles.chipRow}>
            {TOPIC_PRESETS.map(t => {
              const active = topics.includes(t);
              return (
                <TouchableOpacity key={t} onPress={() => toggleTopic(t)}
                  style={[styles.topicBtn, active && styles.topicBtnOn]}>
                  <Text style={[styles.topicBtnText, active && styles.topicBtnTextOn]}>{t}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </SectionBlock>

        {/* ── POLITICAL SPECTRUM ───────────────────────────── */}
        <SectionBlock title="Πολιτικό Φάσμα / Political Spectrum">
          <View style={styles.chipRow}>
            {SPECTRUM_OPTIONS.map(({ label, value }) => (
              <TouchableOpacity
                key={value}
                onPress={() => setPoliticalSpectrum(value)}
                style={[styles.preset, politicalSpectrum === value && styles.presetOn]}
              >
                <Text style={[styles.presetText, politicalSpectrum === value && styles.presetTextOn]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </SectionBlock>

        {/* ── DATE RANGE ───────────────────────────────────── */}
        <SectionBlock title="Πρόσφατη Δραστηριότητα / Activity Range">
          <Text style={styles.fieldHint}>Δημοσιεύσεις εντός:</Text>
          <View style={styles.chipRow}>
            {DATE_RANGE_OPTIONS.map(({ label, value }) => (
              <TouchableOpacity
                key={value}
                onPress={() => setDateRange(value)}
                style={[styles.preset, dateRange === value && styles.presetOn]}
              >
                <Text style={[styles.presetText, dateRange === value && styles.presetTextOn]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={[styles.twoCol, { marginTop: 10 }]}>
            <View style={styles.colItem}>
              <Text style={styles.fieldLabel}>Ελ. δημοσιεύσεις/μήνα</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={minPostsPerMonth}
                onChangeText={setMinPostsPerMonth}
                placeholder="0"
                placeholderTextColor={colors.textDim}
              />
            </View>
          </View>
        </SectionBlock>

        {/* ── EXCLUDE KEYWORDS ─────────────────────────────── */}
        <SectionBlock title="Εξαίρεση Λέξεων / Exclude">
          <Text style={styles.fieldHint}>Εξαιρέστε προφίλ που περιέχουν αυτές τις λέξεις:</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="π.χ. διαφήμιση, sponsored…"
              placeholderTextColor={colors.textDim}
              value={excludeInput}
              onChangeText={setExcludeInput}
              onSubmitEditing={addExcludeKw}
              returnKeyType="done"
            />
            <TouchableOpacity onPress={addExcludeKw} style={[styles.addBtn, { backgroundColor: colors.danger }]}>
              <Text style={styles.addBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          {excludeKeywords.length > 0 && (
            <View style={styles.chipRow}>
              {excludeKeywords.map(kw => (
                <TouchableOpacity key={kw} onPress={() => setExcludeKeywords(p => p.filter(k => k !== kw))} style={[styles.kwChip, { borderColor: colors.danger }]}>
                  <Text style={[styles.kwChipText, { color: colors.danger }]}>{kw}  ×</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </SectionBlock>

        {/* ── BIO KEYWORDS ─────────────────────────────── */}
        <SectionBlock title="Λέξεις-κλειδιά Bio / Bio Filter">
          <Text style={styles.fieldHint}>Φιλτράρετε με λέξεις που εμφανίζονται στο βιογραφικό:</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="π.χ. βουλευτής, πρόεδρος…"
              placeholderTextColor={colors.textDim}
              value={bioInput}
              onChangeText={setBioInput}
              onSubmitEditing={addBioKw}
              returnKeyType="done"
            />
            <TouchableOpacity onPress={addBioKw} style={styles.addBtn}>
              <Text style={styles.addBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          {bioKeywords.length > 0 && (
            <View style={styles.chipRow}>
              {bioKeywords.map(kw => (
                <TouchableOpacity key={kw} onPress={() => setBioKeywords(p => p.filter(k => k !== kw))} style={styles.kwChip}>
                  <Text style={styles.kwChipText}>{kw}  ×</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </SectionBlock>

        {/* ── SUBMIT ───────────────────────────────────── */}
        <TouchableOpacity
          onPress={runSearch}
          style={[styles.searchBtn, loading && { opacity: 0.65 }]}
          disabled={loading}
        >
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.bgCard} size="small" />
              <Text style={styles.searchBtnText} numberOfLines={1}>{loadingStep || 'Επεξεργασία…'}</Text>
            </View>
          ) : (
            <Text style={styles.searchBtnText}>Έναρξη Αναζήτησης</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Section wrapper with left-accent bar (Greek gov style)
function SectionBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionAccent} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 14, paddingTop: 16, paddingBottom: 40 },

  // Section
  sectionBlock: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 3,
    backgroundColor: colors.bgCard,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSection,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionAccent: {
    width: 3,
    height: 14,
    backgroundColor: colors.blue,
    borderRadius: 1,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.blueLight,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  sectionBody: { padding: 12 },

  // Inputs
  inputRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  input: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 3,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  addBtn: {
    backgroundColor: colors.blue,
    borderRadius: 3,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { color: colors.text, fontWeight: '700', fontSize: 18, lineHeight: 22 },

  // Chips
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  kwChip: {
    backgroundColor: colors.blueDeep,
    borderRadius: 3,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: colors.blue,
  },
  kwChipText: { color: colors.blueLight, fontSize: 12, fontWeight: '600' },

  // Presets
  preset: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgInput,
  },
  presetOn: { borderColor: colors.blue, backgroundColor: colors.blueDeep },
  presetText: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  presetTextOn: { color: colors.blueLight },

  // Platform buttons
  platformBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgInput,
  },
  platformBtnOn: { borderColor: colors.blue, backgroundColor: colors.blueDeep },
  platformBtnText: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  platformBtnTextOn: { color: colors.blueLight },

  // Language
  langBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgInput,
    alignItems: 'center',
  },
  langBtnOn: { borderColor: colors.blue, backgroundColor: colors.blueDeep },
  langCode: { fontSize: 11, fontWeight: '800', color: colors.textMuted, letterSpacing: 0.5 },
  langLabel: { fontSize: 9, color: colors.textDim, marginTop: 1 },
  langLabelOn: { color: colors.blueLight },

  // Two column grid
  twoCol: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  colItem: { flex: 1, minWidth: '30%' },
  fieldLabel: { fontSize: 10, color: colors.textMuted, marginBottom: 4, letterSpacing: 0.4 },
  fieldHint: { fontSize: 10, color: colors.textDim, marginTop: 6, marginBottom: 4 },

  // Switch row
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  // Type buttons
  typeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgInput,
  },
  typeBtnOn: { borderColor: colors.blue, backgroundColor: colors.blueDeep },
  typeBtnText: { fontSize: 12, color: colors.textMuted },
  typeBtnTextOn: { color: colors.blueLight, fontWeight: '600' },

  // Topics
  topicBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgInput,
  },
  topicBtnOn: { borderColor: colors.blue, backgroundColor: colors.blueDeep },
  topicBtnText: { fontSize: 12, color: colors.textMuted },
  topicBtnTextOn: { color: colors.blueLight, fontWeight: '600' },

  // Divider
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 10 },

  // Submit
  searchBtn: {
    backgroundColor: colors.gold,
    borderRadius: 3,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 6,
  },
  searchBtnText: { fontSize: 15, fontWeight: '800', color: colors.bgCard, letterSpacing: 0.5 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
