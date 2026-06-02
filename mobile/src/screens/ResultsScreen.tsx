import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, RankedInfluencer } from '../types';
import { colors, PLATFORM_ICONS, PLATFORM_COLORS, scoreColor, formatNumber } from '../theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Results'>;
  route: RouteProp<RootStackParamList, 'Results'>;
};

export default function ResultsScreen({ navigation, route }: Props) {
  const { result } = route.params;
  const [sortBy, setSortBy] = useState<'relevanceScore' | 'followers' | 'engagementRate'>('relevanceScore');

  const sorted = [...result.influencers].sort((a, b) => b[sortBy] - a[sortBy]);

  const totalReach = sorted.reduce((s, i) => s + i.reachEstimate, 0);
  const avgScore   = Math.round(sorted.reduce((s, i) => s + i.relevanceScore, 0) / sorted.length);

  function renderCard({ item, index }: { item: RankedInfluencer; index: number }) {
    const sc = scoreColor(item.relevanceScore);
    const pc = PLATFORM_COLORS[item.platform] ?? colors.slate500;
    return (
      <TouchableOpacity
        style={s.card}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('Detail', { influencer: item, rank: index + 1 })}
      >
        <View style={s.cardTop}>
          {/* Rank */}
          <View style={s.rankBadge}><Text style={s.rankText}>{index + 1}</Text></View>
          {/* Platform avatar */}
          <View style={[s.avatar, { backgroundColor: `${pc}22`, borderColor: `${pc}55` }]}>
            <Text style={s.avatarIcon}>{PLATFORM_ICONS[item.platform]}</Text>
          </View>
          {/* Name / handle */}
          <View style={s.cardInfo}>
            <View style={s.nameRow}>
              <Text style={s.displayName} numberOfLines={1}>{item.displayName}</Text>
              {item.verifiedAccount && <Text style={s.verified}>✓</Text>}
            </View>
            <Text style={s.username} numberOfLines={1}>@{item.username}</Text>
          </View>
          {/* Score ring */}
          <View style={[s.scoreRing, { borderColor: sc }]}>
            <Text style={[s.scoreText, { color: sc }]}>{item.relevanceScore}</Text>
          </View>
        </View>

        {/* Topic chips */}
        <View style={s.topics}>
          {item.politicalTopics.slice(0, 3).map(t => (
            <View key={t} style={s.topicChip}>
              <Text style={s.topicText}>{t}</Text>
            </View>
          ))}
        </View>

        {/* Metrics */}
        <View style={s.metrics}>
          {[
            { label: 'Followers', val: formatNumber(item.followers) },
            { label: 'Engagement', val: `${item.engagementRate}%` },
            { label: 'AI Score', val: item.relevanceScore.toString() },
          ].map(({ label, val }) => (
            <View key={label} style={s.metric}>
              <Text style={s.metricVal}>{val}</Text>
              <Text style={s.metricLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* AI summary preview */}
        <Text style={s.summary} numberOfLines={2}>{item.aiSummary}</Text>
        <View style={s.tapHint}><Text style={s.tapHintText}>Tap for full intelligence brief →</Text></View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      {/* Summary bar */}
      <View style={s.summaryBar}>
        <View style={s.summaryBarItem}>
          <Text style={s.summaryBarNum}>{sorted.length}</Text>
          <Text style={s.summaryBarLabel}>Results</Text>
        </View>
        <View style={s.summaryBarDivider} />
        <View style={s.summaryBarItem}>
          <Text style={s.summaryBarNum}>{formatNumber(totalReach)}</Text>
          <Text style={s.summaryBarLabel}>Total Reach</Text>
        </View>
        <View style={s.summaryBarDivider} />
        <View style={s.summaryBarItem}>
          <Text style={s.summaryBarNum}>{avgScore}</Text>
          <Text style={s.summaryBarLabel}>Avg Score</Text>
        </View>
        {result.tier === 'free' && (
          <>
            <View style={s.summaryBarDivider} />
            <View style={[s.summaryBarItem, s.freeBadge]}>
              <Text style={s.freeBadgeText}>FREE</Text>
            </View>
          </>
        )}
      </View>

      {/* Sort row */}
      <View style={s.sortRow}>
        <Text style={s.sortLabel}>Sort:</Text>
        {([
          ['relevanceScore', 'AI Score'],
          ['followers',      'Followers'],
          ['engagementRate', 'Engagement'],
        ] as const).map(([key, label]) => (
          <TouchableOpacity
            key={key}
            style={[s.sortChip, sortBy === key && s.sortChipActive]}
            onPress={() => setSortBy(key)}
          >
            <Text style={[s.sortChipText, sortBy === key && s.sortChipTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={sorted}
        keyExtractor={item => item.id}
        renderItem={renderCard}
        contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListFooterComponent={
          result.tier === 'free' ? (
            <View style={s.upgradeBox}>
              <Text style={s.upgradeTitle}>🔒  Upgrade to PRO</Text>
              <Text style={s.upgradeText}>
                Unlock 100 results per search, real API data, unlimited daily searches, and CSV export.
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:               { flex: 1, backgroundColor: colors.navy },
  summaryBar:         { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.navyMid, paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.slate700 },
  summaryBarItem:     { flex: 1, alignItems: 'center' },
  summaryBarNum:      { fontSize: 18, fontWeight: '900', color: colors.white },
  summaryBarLabel:    { fontSize: 10, color: colors.slate400, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryBarDivider:  { width: 1, height: 28, backgroundColor: colors.slate700 },
  freeBadge:          { flex: 0, paddingHorizontal: 12 },
  freeBadgeText:      { fontSize: 10, fontWeight: '800', color: colors.slate400, backgroundColor: colors.slate700, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, overflow: 'hidden' },
  sortRow:            { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.slate700 },
  sortLabel:          { fontSize: 11, color: colors.slate500, marginRight: 4 },
  sortChip:           { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: colors.slate700 },
  sortChipActive:     { borderColor: colors.gold, backgroundColor: `${colors.gold}14` },
  sortChipText:       { fontSize: 11, color: colors.slate400 },
  sortChipTextActive: { color: colors.gold, fontWeight: '700' },
  card:               { backgroundColor: colors.navyCard, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.navyLite },
  cardTop:            { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  rankBadge:          { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.slate700, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  rankText:           { fontSize: 10, fontWeight: '800', color: colors.slate300 },
  avatar:             { width: 44, height: 44, borderRadius: 22, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  avatarIcon:         { fontSize: 20 },
  cardInfo:           { flex: 1 },
  nameRow:            { flexDirection: 'row', alignItems: 'center', gap: 6 },
  displayName:        { fontSize: 14, fontWeight: '700', color: colors.white },
  verified:           { fontSize: 12, color: '#38bdf8' },
  username:           { fontSize: 12, color: colors.slate400, marginTop: 1 },
  scoreRing:          { width: 44, height: 44, borderRadius: 22, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  scoreText:          { fontSize: 13, fontWeight: '900' },
  topics:             { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  topicChip:          { backgroundColor: colors.slate800, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  topicText:          { fontSize: 10, color: colors.slate400, textTransform: 'capitalize' },
  metrics:            { flexDirection: 'row', gap: 8, marginBottom: 12 },
  metric:             { flex: 1, backgroundColor: `${colors.slate800}99`, borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  metricVal:          { fontSize: 14, fontWeight: '800', color: colors.white },
  metricLabel:        { fontSize: 9, color: colors.slate500, marginTop: 2, textTransform: 'uppercase' },
  summary:            { fontSize: 12, color: colors.slate400, lineHeight: 18, marginBottom: 8 },
  tapHint:            { alignItems: 'flex-end' },
  tapHintText:        { fontSize: 11, color: `${colors.gold}88` },
  upgradeBox:         { marginTop: 16, padding: 20, backgroundColor: `${colors.gold}0a`, borderRadius: 14, borderWidth: 1, borderColor: `${colors.gold}33` },
  upgradeTitle:       { fontSize: 15, fontWeight: '800', color: colors.gold, marginBottom: 6 },
  upgradeText:        { fontSize: 13, color: colors.slate400, lineHeight: 19 },
});
