import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Share, Alert, Linking,
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
  const platformColor = PLATFORM_COLORS[r.platform] ?? colors.blue;
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
        message:
          `${r.displayName} (@${r.username}) — ${PLATFORM_LABELS[r.platform]}\n` +
          `Βαθμολογία: ${r.relevanceScore}/100 · ${r.tier.toUpperCase()} TIER\n` +
          `Followers: ${formatNumber(r.followers)} · Engagement: ${r.engagementRate}%\n` +
          `${r.profileUrl}\n\n${r.aiSummary}`,
        title: `AI-MOG.IO: ${r.displayName}`,
      });
    } catch (e: any) {
      Alert.alert('Αποτυχία κοινοποίησης', e.message);
    }
  }

  async function openProfile() {
    if (!r.profileUrl) return;
    const canOpen = await Linking.canOpenURL(r.profileUrl);
    if (canOpen) {
      await Linking.openURL(r.profileUrl);
    } else {
      Alert.alert('Αδύνατο άνοιγμα', r.profileUrl);
    }
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>

      {/* ── SCORE HERO ─────────────────────────────── */}
      <View style={[styles.hero, { backgroundColor: sb, borderColor: sc }]}>
        <Text style={[styles.heroScore, { color: sc }]}>{r.relevanceScore}</Text>
        <Text style={styles.heroLabel}>ΒΑΘΜΟΛΟΓΙΑ ΣΧΕΤΙΚΟΤΗΤΑΣ</Text>
        <View style={[styles.tierBadge, { borderColor: sc }]}>
          <Text style={[styles.tierText, { color: sc }]}>{r.tier.toUpperCase()} TIER</Text>
        </View>
      </View>

      {/* ── IDENTITY ───────────────────────────────── */}
      <Block title="Ταυτότητα Προφίλ">
        <View style={styles.identRow}>
          <View style={[styles.platformBadge, { backgroundColor: platformColor + '22', borderColor: platformColor }]}>
            <Text style={[styles.platformBadgeText, { color: platformColor }]}>{PLATFORM_ICONS[r.platform]}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.displayName} numberOfLines={1}>{r.displayName}</Text>
              {r.verifiedAccount && <Text style={[styles.verifiedBadge, { color: colors.blue }]}>✓</Text>}
            </View>
            <Text style={styles.username}>@{r.username} · {PLATFORM_LABELS[r.platform]}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaItem}>📍 {r.location}</Text>
          <Text style={styles.metaItem}>🌐 {r.language.toUpperCase()}</Text>
        </View>

        {r.bio ? <Text style={styles.bio}>{r.bio}</Text> : null}

        {r.profileUrl ? (
          <TouchableOpacity onPress={openProfile} style={styles.profileLinkBtn}>
            <Text style={styles.profileLinkIcon}>↗</Text>
            <Text style={styles.profileLinkText} numberOfLines={1}>{r.profileUrl}</Text>
          </TouchableOpacity>
        ) : null}
      </Block>

      {/* ── METRICS ────────────────────────────────── */}
      <Block title="Μετρικές Αποδοτικότητας">
        <View style={styles.metricsGrid}>
          <MetricBox label="Ακόλουθοι" value={formatNumber(r.followers)} highlight />
          <MetricBox label="Engagement" value={`${r.engagementRate.toFixed(2)}%`} />
          <MetricBox label="Avg Likes" value={formatNumber(r.avgLikes)} />
          <MetricBox label="Avg Σχόλια" value={formatNumber(r.avgComments)} />
          <MetricBox label="Εκτιμ. Εμβέλεια" value={formatNumber(r.reachEstimate)} highlight />
        </View>
      </Block>

      {/* ── POLITICAL TOPICS ───────────────────────── */}
      {r.politicalTopics.length > 0 && (
        <Block title="Πολιτικά Θέματα">
          <View style={styles.topicsRow}>
            {r.politicalTopics.map(t => (
              <View key={t} style={styles.topicChip}>
                <Text style={styles.topicText}>{t}</Text>
              </View>
            ))}
          </View>
        </Block>
      )}

      {/* ── AI SUMMARY ─────────────────────────────── */}
      <Block title="Στρατηγική Ανάλυση ΤΝ">
        <Text style={styles.aiSummary}>{r.aiSummary}</Text>
      </Block>

      {/* ── SCORING REASON ─────────────────────────── */}
      {r.scoringReason ? (
        <Block title="Ανάλυση Βαθμολογίας">
          <View style={styles.scoreBreakdown}>
            <View style={styles.scoreBarRow}>
              <View style={[styles.scoreBar, { width: `${r.relevanceScore}%` as any, backgroundColor: sc }]} />
            </View>
            <Text style={styles.scoreBarLabel}>{r.relevanceScore} / 100</Text>
          </View>
          <Text style={styles.scoringReason}>{r.scoringReason}</Text>
        </Block>
      ) : null}

      {/* ── ACTIONS ────────────────────────────────── */}
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={handleBookmark}
          style={[styles.actionBtn, bookmarked && styles.actionBtnActive]}
        >
          <Text style={[styles.actionBtnText, bookmarked && { color: colors.gold }]}>
            {bookmarked ? '★ Αποθηκευμένο' : '☆ Αποθήκευση'}
          </Text>
        </TouchableOpacity>
        {r.profileUrl ? (
          <TouchableOpacity onPress={openProfile} style={[styles.actionBtn, { borderColor: platformColor }]}>
            <Text style={[styles.actionBtnText, { color: platformColor }]}>↗ Προφίλ</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity onPress={handleShare} style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>⬡ Κοινοποίηση</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardAccent} />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <View style={styles.cardBody}>{children}</View>
    </View>
  );
}

function MetricBox({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={[styles.metricBox, highlight && styles.metricBoxHL]}>
      <Text style={[styles.metricValue, highlight && { color: colors.blueLight }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 14, paddingBottom: 40 },

  // Hero
  hero: {
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 1.5,
    padding: 24,
    marginBottom: 10,
  },
  heroScore: { fontSize: 72, fontWeight: '900', lineHeight: 80 },
  heroLabel: {
    fontSize: 10, color: colors.textMuted, marginTop: 4,
    textTransform: 'uppercase', letterSpacing: 1.5,
  },
  tierBadge: {
    marginTop: 10, borderWidth: 1, borderRadius: 3,
    paddingHorizontal: 14, paddingVertical: 4,
  },
  tierText: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },

  // Card block
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSection,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cardAccent: { width: 3, height: 12, backgroundColor: colors.blue, borderRadius: 1, marginRight: 8 },
  cardTitle: {
    fontSize: 10, fontWeight: '700', color: colors.blueLight,
    letterSpacing: 1.2, textTransform: 'uppercase',
  },
  cardBody: { padding: 12 },

  // Identity
  identRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  platformBadge: {
    width: 42, height: 42, borderRadius: 3,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  platformBadgeText: { fontSize: 14, fontWeight: '800' },
  displayName: { fontSize: 17, fontWeight: '800', color: colors.text },
  verifiedBadge: { fontSize: 14, fontWeight: '700' },
  username: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  metaRow: { flexDirection: 'row', gap: 14, marginBottom: 8 },
  metaItem: { fontSize: 12, color: colors.textMuted },
  bio: { fontSize: 13, color: colors.text, lineHeight: 19, marginBottom: 10 },

  profileLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.bgInput,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.borderActive,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginTop: 4,
  },
  profileLinkIcon: { fontSize: 13, color: colors.blueLight, fontWeight: '700' },
  profileLinkText: { flex: 1, fontSize: 11, color: colors.blueLight },

  // Metrics
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metricBox: {
    width: '30%', flexGrow: 1,
    backgroundColor: colors.bgInput,
    borderRadius: 3,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricBoxHL: { borderColor: colors.blueDim, backgroundColor: colors.blueDeep },
  metricValue: { fontSize: 17, fontWeight: '800', color: colors.text },
  metricLabel: { fontSize: 9, color: colors.textMuted, textTransform: 'uppercase', marginTop: 2, letterSpacing: 0.5 },

  // Topics
  topicsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  topicChip: {
    backgroundColor: colors.bgInput,
    borderRadius: 3,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: colors.border,
  },
  topicText: { fontSize: 12, color: colors.textMuted },

  // AI summary
  aiSummary: { fontSize: 14, color: colors.text, lineHeight: 21 },

  // Scoring reason
  scoreBreakdown: { marginBottom: 10 },
  scoreBarRow: {
    height: 4, backgroundColor: colors.bgInput, borderRadius: 2,
    marginBottom: 4, overflow: 'hidden',
  },
  scoreBar: { height: '100%', borderRadius: 2 },
  scoreBarLabel: { fontSize: 10, color: colors.textMuted, textAlign: 'right' },
  scoringReason: { fontSize: 13, color: colors.textSub, lineHeight: 20 },

  // Actions
  actions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  actionBtn: {
    flex: 1, minWidth: '30%',
    backgroundColor: colors.bgCard,
    borderRadius: 3,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionBtnActive: { borderColor: colors.gold, backgroundColor: colors.bgInput },
  actionBtnText: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
});
