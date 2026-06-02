import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { colors, PLATFORM_ICONS, PLATFORM_COLORS, scoreColor, formatNumber } from '../theme';

type Props = {
  route: RouteProp<RootStackParamList, 'Detail'>;
};

const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  twitter:   'X / Twitter',
  youtube:   'YouTube',
  tiktok:    'TikTok',
  facebook:  'Facebook',
};

export default function DetailScreen({ route }: Props) {
  const { influencer: inf, rank } = route.params;
  const sc = scoreColor(inf.relevanceScore);
  const pc = PLATFORM_COLORS[inf.platform] ?? colors.slate500;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <View style={[s.avatar, { backgroundColor: `${pc}22`, borderColor: `${pc}55` }]}>
            <Text style={s.avatarIcon}>{PLATFORM_ICONS[inf.platform]}</Text>
          </View>
          <View style={s.headerInfo}>
            <View style={s.nameRow}>
              <Text style={s.displayName}>{inf.displayName}</Text>
              {inf.verifiedAccount && <Text style={s.verified}>  ✓</Text>}
            </View>
            <Text style={s.username}>@{inf.username}  ·  {PLATFORM_LABELS[inf.platform]}</Text>
            <Text style={s.location}>{inf.location}  ·  {inf.language}</Text>
          </View>
          <View style={s.rankBadge}><Text style={s.rankText}>#{rank}</Text></View>
        </View>

        {/* Score banner */}
        <View style={[s.scoreBanner, { borderColor: `${sc}44` }]}>
          <View>
            <Text style={[s.bigScore, { color: sc }]}>{inf.relevanceScore}</Text>
            <Text style={s.scoreSubtitle}>AI Relevance Score</Text>
          </View>
          <View style={s.scoreDivider} />
          <View>
            <Text style={[s.tierLabel, { color: sc }]}>{inf.tier.toUpperCase()} PRIORITY</Text>
            <Text style={s.reachNum}>{formatNumber(inf.reachEstimate)}</Text>
            <Text style={s.reachLabel}>Estimated Reach</Text>
          </View>
        </View>

        {/* Metrics grid */}
        <View style={s.metricsGrid}>
          {[
            { label: 'Followers',   val: formatNumber(inf.followers) },
            { label: 'Engagement',  val: `${inf.engagementRate}%` },
            { label: 'Avg Likes',   val: formatNumber(inf.avgLikes) },
            { label: 'Posts / Week',val: inf.postsPerWeek.toString() },
          ].map(({ label, val }) => (
            <View key={label} style={s.metricCell}>
              <Text style={s.metricVal}>{val}</Text>
              <Text style={s.metricLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Bio */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Bio</Text>
          <Text style={s.bioText}>{inf.bio}</Text>
        </View>

        {/* Political Topics */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Political Topics</Text>
          <View style={s.topicRow}>
            {inf.politicalTopics.map(t => (
              <View key={t} style={s.topicChip}>
                <Text style={s.topicText}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* AI Intelligence Brief */}
        <View style={[s.section, s.aiPanel]}>
          <View style={s.aiHeader}>
            <Text style={s.aiIcon}>🤖</Text>
            <Text style={s.aiTitle}>AI Intelligence Brief</Text>
          </View>
          <Text style={s.aiSubtitle}>Why this influencer matters for your campaign</Text>
          <Text style={s.aiBody}>{inf.aiSummary}</Text>
          <View style={s.aiFooter}>
            <Text style={s.aiFooterText}>Analysed by Llama 3.3 70B via Groq</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: colors.navy },
  scroll:       { padding: 20, paddingBottom: 48 },
  header:       { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar:       { width: 56, height: 56, borderRadius: 28, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginRight: 14, flexShrink: 0 },
  avatarIcon:   { fontSize: 24 },
  headerInfo:   { flex: 1 },
  nameRow:      { flexDirection: 'row', alignItems: 'center' },
  displayName:  { fontSize: 18, fontWeight: '800', color: colors.white },
  verified:     { fontSize: 14, color: '#38bdf8' },
  username:     { fontSize: 12, color: colors.slate400, marginTop: 2 },
  location:     { fontSize: 11, color: colors.slate500, marginTop: 2 },
  rankBadge:    { backgroundColor: colors.slate700, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  rankText:     { fontSize: 12, fontWeight: '800', color: colors.slate300 },
  scoreBanner:  { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.navyCard, borderRadius: 14, padding: 20, marginBottom: 16, borderWidth: 1 },
  bigScore:     { fontSize: 52, fontWeight: '900', lineHeight: 56 },
  scoreSubtitle:{ fontSize: 11, color: colors.slate400, marginTop: 2 },
  scoreDivider: { width: 1, height: 50, backgroundColor: colors.slate700, marginHorizontal: 20 },
  tierLabel:    { fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 6 },
  reachNum:     { fontSize: 22, fontWeight: '800', color: colors.white },
  reachLabel:   { fontSize: 11, color: colors.slate400, marginTop: 2 },
  metricsGrid:  { flexDirection: 'row', gap: 8, marginBottom: 20 },
  metricCell:   { flex: 1, backgroundColor: colors.navyCard, borderRadius: 12, padding: 12, alignItems: 'center' },
  metricVal:    { fontSize: 16, fontWeight: '800', color: colors.white, marginBottom: 3 },
  metricLabel:  { fontSize: 9, color: colors.slate500, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.5 },
  section:      { marginBottom: 16 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: colors.slate400, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  bioText:      { fontSize: 14, color: colors.slate300, lineHeight: 21, backgroundColor: colors.navyCard, borderRadius: 12, padding: 14 },
  topicRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  topicChip:    { backgroundColor: `${colors.gold}14`, borderWidth: 1, borderColor: `${colors.gold}33`, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  topicText:    { fontSize: 12, color: colors.gold, textTransform: 'capitalize' },
  aiPanel:      { backgroundColor: `${colors.emerald}08`, borderRadius: 14, padding: 18, borderWidth: 1, borderColor: `${colors.emerald}22` },
  aiHeader:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  aiIcon:       { fontSize: 16 },
  aiTitle:      { fontSize: 13, fontWeight: '800', color: colors.emerald, textTransform: 'uppercase', letterSpacing: 0.8 },
  aiSubtitle:   { fontSize: 11, color: colors.slate500, marginBottom: 12 },
  aiBody:       { fontSize: 14, color: colors.slate300, lineHeight: 22 },
  aiFooter:     { marginTop: 14, paddingTop: 10, borderTopWidth: 1, borderTopColor: `${colors.emerald}18` },
  aiFooterText: { fontSize: 10, color: colors.slate500 },
});
