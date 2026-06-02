import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, SafeAreaView, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, SearchParams } from '../types';
import { searchInfluencers } from '../services/api';
import { colors } from '../theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Search'>;
};

const PLATFORMS = [
  { id: 'instagram' as const, label: 'Instagram', icon: '📸' },
  { id: 'twitter'   as const, label: 'X / Twitter', icon: '🐦' },
  { id: 'youtube'   as const, label: 'YouTube', icon: '▶' },
  { id: 'tiktok'    as const, label: 'TikTok', icon: '♪' },
  { id: 'facebook'  as const, label: 'Facebook', icon: '👥' },
];

const TOPICS = [
  'healthcare', 'economy', 'immigration', 'climate change', 'education',
  'taxes', 'foreign policy', 'gun control', 'social justice', 'infrastructure',
  'housing', 'criminal justice', 'energy policy', 'labor rights',
];

export default function SearchScreen({ navigation }: Props) {
  const [keyword, setKeyword]         = useState('');
  const [keywords, setKeywords]       = useState<string[]>([]);
  const [location, setLocation]       = useState('');
  const [platforms, setPlatforms]     = useState<typeof PLATFORMS[number]['id'][]>(['twitter', 'instagram', 'youtube']);
  const [followerMin, setFollowerMin] = useState('10000');
  const [followerMax, setFollowerMax] = useState('1000000');
  const [engMin, setEngMin]           = useState('1');
  const [topics, setTopics]           = useState<string[]>([]);
  const [loading, setLoading]         = useState(false);

  function addKeyword() {
    const t = keyword.trim();
    if (t && !keywords.includes(t)) setKeywords(prev => [...prev, t]);
    setKeyword('');
  }

  function togglePlatform(id: typeof PLATFORMS[number]['id']) {
    setPlatforms(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function toggleTopic(t: string) {
    setTopics(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  }

  async function handleSearch() {
    if (keywords.length === 0) {
      Alert.alert('Add Keywords', 'Enter at least one campaign keyword before searching.');
      return;
    }
    if (platforms.length === 0) {
      Alert.alert('Select Platforms', 'Select at least one social media platform.');
      return;
    }
    setLoading(true);
    const params: SearchParams = {
      keywords,
      location,
      platforms,
      followerMin: parseInt(followerMin) || 1000,
      followerMax: parseInt(followerMax) || 10_000_000,
      engagementMin: parseFloat(engMin) || 0,
      language: 'English',
      politicalTopics: topics,
    };
    try {
      const result = await searchInfluencers(params);
      navigation.navigate('Results', { result, params });
    } catch (err) {
      Alert.alert('Search Failed', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          <SectionLabel>Campaign Keywords</SectionLabel>
          <View style={s.row}>
            <TextInput
              style={s.inputFlex}
              value={keyword}
              onChangeText={setKeyword}
              onSubmitEditing={addKeyword}
              placeholder="e.g. healthcare reform"
              placeholderTextColor={colors.slate500}
              returnKeyType="done"
            />
            <TouchableOpacity style={s.addBtn} onPress={addKeyword}>
              <Text style={s.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
          {keywords.length > 0 && (
            <View style={s.tags}>
              {keywords.map(kw => (
                <TouchableOpacity key={kw} style={s.tag} onPress={() => setKeywords(p => p.filter(k => k !== kw))}>
                  <Text style={s.tagText}>{kw}  ✕</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {keywords.length === 0 && <Text style={s.hint}>Type a keyword and tap Add</Text>}

          <SectionLabel>Target Location</SectionLabel>
          <TextInput
            style={s.input}
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. New York, NY (leave blank for national)"
            placeholderTextColor={colors.slate500}
          />

          <SectionLabel>Platforms</SectionLabel>
          {PLATFORMS.map(p => (
            <TouchableOpacity key={p.id} style={s.checkRow} onPress={() => togglePlatform(p.id)} activeOpacity={0.7}>
              <View style={[s.checkbox, platforms.includes(p.id) && s.checkboxActive]}>
                {platforms.includes(p.id) && <Text style={s.checkmark}>✓</Text>}
              </View>
              <Text style={s.checkLabel}>{p.icon}  {p.label}</Text>
            </TouchableOpacity>
          ))}

          <SectionLabel>Follower Range</SectionLabel>
          <View style={s.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={s.subLabel}>Minimum</Text>
              <TextInput style={s.input} value={followerMin} onChangeText={setFollowerMin} keyboardType="numeric" placeholderTextColor={colors.slate500} />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={s.subLabel}>Maximum</Text>
              <TextInput style={s.input} value={followerMax} onChangeText={setFollowerMax} keyboardType="numeric" placeholderTextColor={colors.slate500} />
            </View>
          </View>

          <SectionLabel>Min Engagement Rate (%)</SectionLabel>
          <TextInput
            style={s.input}
            value={engMin}
            onChangeText={setEngMin}
            keyboardType="decimal-pad"
            placeholder="e.g. 2.5"
            placeholderTextColor={colors.slate500}
          />

          <SectionLabel>Political Topics</SectionLabel>
          <View style={s.topicGrid}>
            {TOPICS.map(t => (
              <TouchableOpacity
                key={t}
                style={[s.topicChip, topics.includes(t) && s.topicChipActive]}
                onPress={() => toggleTopic(t)}
                activeOpacity={0.7}
              >
                <Text style={[s.topicText, topics.includes(t) && s.topicTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={[s.searchBtn, loading && s.searchBtnDisabled]} onPress={handleSearch} disabled={loading} activeOpacity={0.85}>
            {loading
              ? <View style={s.loadingRow}><ActivityIndicator color={colors.navy} /><Text style={[s.searchBtnText, { marginLeft: 8 }]}>AI Agent Running…</Text></View>
              : <Text style={s.searchBtnText}>🔍  Find Influencers</Text>
            }
          </TouchableOpacity>

          {loading && (
            <View style={s.loadingSteps}>
              {['Gathering profiles…', 'Analyzing content…', 'Scoring relevance…', 'Ranking results…'].map((step, i) => (
                <Text key={i} style={s.loadingStep}>• {step}</Text>
              ))}
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SectionLabel({ children }: { children: string }) {
  return <Text style={sectionLabelStyle}>{children}</Text>;
}
const sectionLabelStyle: object = {
  fontSize: 11, fontWeight: '700', color: colors.slate400,
  textTransform: 'uppercase', letterSpacing: 1,
  marginTop: 24, marginBottom: 10,
};

const s = StyleSheet.create({
  safe:              { flex: 1, backgroundColor: colors.navy },
  scroll:            { padding: 20, paddingBottom: 48 },
  row:               { flexDirection: 'row', alignItems: 'center' },
  input:             { backgroundColor: colors.navyCard, borderWidth: 1, borderColor: colors.slate700, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: colors.white, marginBottom: 2 },
  inputFlex:         { flex: 1, backgroundColor: colors.navyCard, borderWidth: 1, borderColor: colors.slate700, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: colors.white, marginRight: 8 },
  addBtn:            { backgroundColor: `${colors.gold}18`, borderWidth: 1, borderColor: `${colors.gold}44`, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12 },
  addBtnText:        { fontSize: 13, fontWeight: '700', color: colors.gold },
  tags:              { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  tag:               { flexDirection: 'row', alignItems: 'center', backgroundColor: `${colors.gold}18`, borderWidth: 1, borderColor: `${colors.gold}44`, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  tagText:           { fontSize: 12, color: colors.gold },
  hint:              { fontSize: 11, color: colors.slate500, marginTop: 6 },
  subLabel:          { fontSize: 11, color: colors.slate500, marginBottom: 6 },
  checkRow:          { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  checkbox:          { width: 22, height: 22, borderRadius: 5, borderWidth: 2, borderColor: colors.slate600, marginRight: 12, alignItems: 'center', justifyContent: 'center' },
  checkboxActive:    { backgroundColor: colors.gold, borderColor: colors.gold },
  checkmark:         { fontSize: 12, fontWeight: '900', color: colors.navy },
  checkLabel:        { fontSize: 14, color: colors.slate400 },
  topicGrid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  topicChip:         { borderWidth: 1, borderColor: colors.slate700, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  topicChipActive:   { borderColor: `${colors.gold}66`, backgroundColor: `${colors.gold}14` },
  topicText:         { fontSize: 12, color: colors.slate400, textTransform: 'capitalize' },
  topicTextActive:   { color: colors.gold },
  searchBtn:         { backgroundColor: colors.gold, borderRadius: 12, paddingVertical: 17, alignItems: 'center', marginTop: 32 },
  searchBtnDisabled: { opacity: 0.6 },
  searchBtnText:     { fontSize: 16, fontWeight: '800', color: colors.navy },
  loadingRow:        { flexDirection: 'row', alignItems: 'center' },
  loadingSteps:      { marginTop: 16, padding: 16, backgroundColor: colors.navyCard, borderRadius: 10, borderWidth: 1, borderColor: `${colors.gold}22` },
  loadingStep:       { fontSize: 13, color: colors.slate400, marginBottom: 6 },
});
