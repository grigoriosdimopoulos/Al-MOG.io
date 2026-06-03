import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Share, Alert,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import {
  colors, PLATFORM_COLORS, PLATFORM_LABELS, PLATFORM_ICONS,
  scoreColor, scoreBg, formatNumber,
} from '../theme';
import { toggleBookmark, isBookmarked } from '../storage';
import type { RootStackParamList } from '../types';

type Route = RouteProp<RootStackParamList, 'Detail'>;

export default function DetailScreen() {
  const { params: { influencer: r } } = useRoute<Route>();
  const [bookmarked, setBookmarked] = useState(false);
  const platformColor = PLATFORM_COLORS[r.platform] ?? colors.gold;
  const sc = scoreColor(r.relevanceScore);
  const sb = scoreBg(r.relevanceScore);

  useEffect(() => {
    isBookmarked(r.id).then(setBookmarked);
  }, [r.id]);

  async function handleBookmark() {
    const saved = await toggleBookmark(r);
    setBookmarked(saved);
  }

  async function handleShare() {
    try {
      await Share.share({
        message: `${r.displayName} (@${r.username}) on ${PLATFORM_LABELS[r.platform]}\n` +
          `Followers: ${formatNumber(r.followers)} · Engagement: ${r.engagementRate}%\n` +
          `Relevance Score: ${r.relevanceScore}/100\n\n${r.aiSummary}`,
        title: `Al-MOG: ${r.displayName}`,
      });
    } catch (e: any) {
      Alert.alert('Share failed', e.message);
    }
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {/* Score hero */}
      <View style={[styles.hero, { backgroundColor: sb, borderColor: sc }]}>
        <Text style={[styles.heroScore, { color: sc }]}>{r.relevanceScore}</Text>
        <Text style={styles.heroLabel}>Relevance Score</Text>
        <View style={[styles.tierBadge, { borderColor: sc }]}>
          <Text style={[styles.tierText, { color: sc }]}>{r.tier.toUpperCase()} TIER</Text>
        </View>
      </View>

      {/* Identity */}
      <View style={styles.card}>
        <View style={styles.identRow}>
          <View style={[styles.platformDot, { backgroundColor: platformColor }]}>
            <Text style={styles.platformIcon}>{PLATFORM_ICONS[r.platform]}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.displayName}>{r.displayName}</Text>
              {r.verifiedAccount && <Text style={styles.verified}>✓</Text>}
            </View>
            <Text style={styles.username}>@{r.username} · {PLATFORM_LABELS[r.platform]}</Text>
          </View>
        </View>
        <Text style={styles.location}>📍 {r.location} · 🌐 {r.language.toUpperCase()}</Text>
        {r.bio ? <Text style={styles.bio}>{r.bio}</Text> : null}
      </View>

      {/* Metrics grid */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Metrics</Text>
        <View style={styles.metricsGrid}>
          <MetricBox label="Followers" value={formatNumber(r.followers)} />
          <MetricBox label="Engagement" value={`${r.engagementRate.toFixed(2)}%`} />
          <MetricBox label="Avg Likes" value={formatNumber(r.avgLikes)} />
          <MetricBox label="Avg Comments" value={formatNumber(r.avgComments)} />
          <MetricBox label="Est. Reach" value={formatNumber(r.reachEstimate)} />
        </View>
      </View>

      {/* Political topics */}
      {r.politicalTopics.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Political Topics</Text>
          <View style={styles.topicsRow}>
            {r.politicalTopics.map(t => (
              <View key={t} style={styles.topicChip}>
                <Text style={styles.topicText}>{t}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* AI analysis */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>AI Intelligence Brief</Text>
        <Text style={styles.aiSummary}>{r.aiSummary}</Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={handleBookmark}
          style={[styles.actionBtn, bookmarked && styles.actionBtnActive]}
        >
          <Text style={styles.actionBtnText}>{bookmarked ? '★ Saved' : '☆ Save'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShare} style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>↗ Share</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricBox}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 14, paddingBottom: 40 },
  hero: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 24,
    marginBottom: 12,
  },
  heroScore: { fontSize: 72, fontWeight: '900', lineHeight: 80 },
  heroLabel: { fontSize: 13, color: colors.textMuted, marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 },
  tierBadge: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  tierText: { fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.gold,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  identRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  platformDot: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  platformIcon: { fontSize: 18, color: '#fff' },
  displayName: { fontSize: 18, fontWeight: '800', color: colors.text },
  verified: { fontSize: 16, color: colors.gold },
  username: { fontSize: 13, color: colors.textMuted },
  location: { fontSize: 13, color: colors.textMuted, marginBottom: 8 },
  bio: { fontSize: 14, color: colors.text, lineHeight: 20 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metricBox: {
    width: '30%',
    backgroundColor: colors.bgInput,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  metricValue: { fontSize: 18, fontWeight: '800', color: colors.text },
  metricLabel: { fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', marginTop: 2 },
  topicsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  topicChip: {
    backgroundColor: colors.bgInput,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topicText: { fontSize: 13, color: colors.textMuted },
  aiSummary: { fontSize: 15, color: colors.text, lineHeight: 22 },
  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionBtnActive: { borderColor: colors.gold, backgroundColor: colors.bgInput },
  actionBtnText: { fontSize: 15, fontWeight: '700', color: colors.gold },
});
