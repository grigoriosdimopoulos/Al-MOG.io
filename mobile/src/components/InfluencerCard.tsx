import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, PLATFORM_COLORS, PLATFORM_ICONS, PLATFORM_LABELS, scoreColor, formatNumber } from '../theme';
import type { RankedInfluencer } from '../types';

interface Props {
  influencer: RankedInfluencer;
  rank: number;
  onPress: () => void;
}

export default function InfluencerCard({ influencer: r, rank, onPress }: Props) {
  const platformColor = PLATFORM_COLORS[r.platform] ?? colors.gold;
  const sc = scoreColor(r.relevanceScore);

  return (
    <TouchableOpacity onPress={onPress} style={styles.card} activeOpacity={0.8}>
      <View style={styles.row}>
        <View style={[styles.rankBox, { borderColor: sc }]}>
          <Text style={[styles.rankNum, { color: sc }]}>{rank}</Text>
          <Text style={[styles.score, { color: sc }]}>{r.relevanceScore}</Text>
        </View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <View style={[styles.platformDot, { backgroundColor: platformColor }]}>
              <Text style={styles.platformIcon}>{PLATFORM_ICONS[r.platform]}</Text>
            </View>
            <Text style={styles.displayName} numberOfLines={1}>{r.displayName}</Text>
            {r.verifiedAccount && <Text style={styles.verified}> ✓</Text>}
          </View>

          <View style={styles.usernameRow}>
            <Text style={styles.username}>@{r.username}</Text>
            <View style={[styles.sourceBadge, r.dataSource === 'real' ? styles.sourceBadgeReal : styles.sourceBadgeMock]}>
              <Text style={[styles.sourceBadgeText, r.dataSource === 'real' ? styles.sourceBadgeTextReal : styles.sourceBadgeTextMock]}>
                {r.dataSource === 'real' ? 'ΠΡΑΓΜΑΤΙΚΟ' : 'ΠΡΟΣΟΜΟΙΩΣΗ'}
              </Text>
            </View>
          </View>

          <View style={styles.metrics}>
            <Metric label="Followers" value={formatNumber(r.followers)} />
            <Metric label="Engage" value={`${r.engagementRate.toFixed(1)}%`} />
            <Metric label="Reach" value={formatNumber(r.reachEstimate)} />
          </View>

          {r.politicalTopics.length > 0 && (
            <View style={styles.topics}>
              {r.politicalTopics.slice(0, 3).map(t => (
                <View key={t} style={styles.topicChip}>
                  <Text style={styles.topicText}>{t}</Text>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.summary} numberOfLines={2}>{r.aiSummary}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 8,
  },
  row: { flexDirection: 'row', gap: 12 },
  rankBox: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1.5,
    paddingVertical: 6,
  },
  rankNum: { fontSize: 11, fontWeight: '600', color: colors.textMuted },
  score: { fontSize: 22, fontWeight: '800' },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  platformDot: {
    width: 22,
    height: 22,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  platformIcon: { fontSize: 11, color: '#fff' },
  displayName: { fontSize: 15, fontWeight: '700', color: colors.text, flex: 1 },
  verified: { fontSize: 13, color: colors.gold },
  usernameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  username: { fontSize: 12, color: colors.textMuted },
  sourceBadge: {
    paddingHorizontal: 5, paddingVertical: 1,
    borderRadius: 2, borderWidth: 1,
  },
  sourceBadgeReal: { borderColor: '#2a6b3a', backgroundColor: '#0c2b14' },
  sourceBadgeMock: { borderColor: colors.border, backgroundColor: colors.bgInput },
  sourceBadgeText: { fontSize: 8, fontWeight: '700', letterSpacing: 0.5 },
  sourceBadgeTextReal: { color: '#4caf6e' },
  sourceBadgeTextMock: { color: colors.textDim },
  metrics: { flexDirection: 'row', gap: 14, marginBottom: 8 },
  metric: { alignItems: 'center' },
  metricValue: { fontSize: 14, fontWeight: '700', color: colors.text },
  metricLabel: { fontSize: 10, color: colors.textMuted, textTransform: 'uppercase' },
  topics: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 6 },
  topicChip: {
    backgroundColor: colors.bgInput,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topicText: { fontSize: 10, color: colors.textMuted },
  summary: { fontSize: 12, color: colors.textMuted, lineHeight: 17 },
});
