import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, FlatList,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, formatNumber, PLATFORM_LABELS } from '../theme';
import { getBookmarks, getSettings } from '../storage';
import { analyzeNetwork, analyzeNetworkLocal } from '../services/ai/network';
import type { RankedInfluencer, NetworkAnalysis, NetworkEdge } from '../types';

const STRENGTH_COLOR: Record<NetworkEdge['strength'], string> = {
  strong: colors.success,
  moderate: colors.blue,
  weak: colors.textMuted,
};

const STRENGTH_LABEL: Record<NetworkEdge['strength'], string> = {
  strong: 'Ισχυρή',
  moderate: 'Μέτρια',
  weak: 'Ασθενής',
};

export default function NetworkAnalysisScreen() {
  const [bookmarks, setBookmarks] = useState<RankedInfluencer[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NetworkAnalysis | null>(null);

  useFocusEffect(
    useCallback(() => {
      getBookmarks().then(bm => {
        setBookmarks(bm);
        setResult(null);
        setSelected(new Set());
      });
    }, []),
  );

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= 8) {
          Alert.alert('Μέγιστο 8 επιρροές', 'Απεπιλέξτε κάποια για να προσθέσετε νέα.');
          return prev;
        }
        next.add(id);
      }
      return next;
    });
  }

  async function runAnalysis() {
    if (selected.size < 2) {
      Alert.alert('Επιλέξτε τουλάχιστον 2', 'Χρειάζονται τουλάχιστον 2 επιρροές για ανάλυση δικτύου.');
      return;
    }

    const influencers = bookmarks.filter(b => selected.has(b.id));
    const settings = await getSettings();

    setLoading(true);
    setResult(null);
    try {
      let analysis: NetworkAnalysis;
      if (settings.aiMode === 'anthropic' && settings.anthropicApiKey.trim()) {
        analysis = await analyzeNetwork(settings.anthropicApiKey, influencers);
      } else {
        analysis = await analyzeNetworkLocal(influencers);
      }
      setResult(analysis);
    } catch (e: any) {
      Alert.alert('Αποτυχία ανάλυσης', e.message);
    } finally {
      setLoading(false);
    }
  }

  const selectedInfluencers = bookmarks.filter(b => selected.has(b.id));

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>

      {/* ── HEADER ─────────────────────────────────── */}
      <View style={styles.headerBlock}>
        <View style={styles.headerAccent} />
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Ανάλυση Δικτύου Επιρροών</Text>
          <Text style={styles.headerSub}>
            Επιλέξτε 2–8 αποθηκευμένες επιρροές. Το σύστημα ΤΝ θα αναλύσει όλες τις πιθανές
            συνδέσεις: πολιτικές σχέσεις, φιλίες, επαγγελματικά δίκτυα, κοινές επαφές και ιδεολογικές συμμαχίες.
          </Text>
        </View>
      </View>

      {/* ── SELECT INFLUENCERS ─────────────────────── */}
      <SectionTitle title={`Επιλογή Επιρροών (${selected.size}/8)`} />

      {bookmarks.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Δεν υπάρχουν αποθηκευμένες επιρροές.</Text>
          <Text style={styles.emptyHint}>Αποθηκεύστε επιρροές από την καρτέλα Αναζήτηση.</Text>
        </View>
      ) : (
        bookmarks.map(inf => {
          const isSel = selected.has(inf.id);
          return (
            <TouchableOpacity
              key={inf.id}
              onPress={() => toggle(inf.id)}
              style={[styles.selectRow, isSel && styles.selectRowOn]}
              activeOpacity={0.75}
            >
              <View style={[styles.checkbox, isSel && styles.checkboxOn]}>
                {isSel && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.selName}>{inf.displayName}</Text>
                  {inf.verifiedAccount && <Text style={styles.selVerified}>✓</Text>}
                </View>
                <Text style={styles.selMeta}>
                  {PLATFORM_LABELS[inf.platform]} · {formatNumber(inf.followers)} followers · Score {inf.relevanceScore}
                </Text>
              </View>
              <View style={[styles.scoreDot, { backgroundColor: isSel ? colors.blue : colors.border }]}>
                <Text style={[styles.scoreDotText, { color: isSel ? colors.text : colors.textDim }]}>
                  {inf.relevanceScore}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })
      )}

      {/* ── ANALYZE BUTTON ─────────────────────────── */}
      {selected.size >= 2 && (
        <TouchableOpacity
          onPress={runAnalysis}
          style={[styles.analyzeBtn, loading && { opacity: 0.6 }]}
          disabled={loading}
        >
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.bgCard} size="small" />
              <Text style={styles.analyzeBtnText}>Ανάλυση δικτύου…</Text>
            </View>
          ) : (
            <Text style={styles.analyzeBtnText}>
              Ανάλυση {selected.size} Επιρροών
            </Text>
          )}
        </TouchableOpacity>
      )}

      {/* ── RESULTS ────────────────────────────────── */}
      {result && (
        <>
          {/* Summary */}
          <SectionTitle title="Σύνοψη Δικτύου" />
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryText}>{result.summary}</Text>
          </View>

          {/* Stats bar */}
          <View style={styles.statsRow}>
            <StatChip label="Επιρροές" value={result.influencers.length.toString()} />
            <StatChip label="Συνδέσεις" value={result.edges.length.toString()} />
            <StatChip label="Ισχυρές" value={result.edges.filter(e => e.strength === 'strong').length.toString()} color={colors.success} />
            <StatChip label="Μέτριες" value={result.edges.filter(e => e.strength === 'moderate').length.toString()} color={colors.blue} />
          </View>

          {/* Key insights */}
          {result.keyInsights.length > 0 && (
            <>
              <SectionTitle title="Βασικά Ευρήματα" />
              <View style={styles.insightsBlock}>
                {result.keyInsights.map((ins, i) => (
                  <View key={i} style={styles.insightRow}>
                    <View style={styles.insightDot} />
                    <Text style={styles.insightText}>{ins}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Edge list */}
          <SectionTitle title={`Χάρτης Συνδέσεων (${result.edges.length})`} />
          {result.edges.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>Δεν εντοπίστηκαν συνδέσεις.</Text>
            </View>
          ) : (
            result.edges
              .sort((a, b) => b.confidence - a.confidence)
              .map((edge, i) => {
                const fromInf = result.influencers.find(x => x.id === edge.fromId);
                const toInf = result.influencers.find(x => x.id === edge.toId);
                if (!fromInf || !toInf) return null;
                const sc = STRENGTH_COLOR[edge.strength];
                return (
                  <View key={i} style={[styles.edgeCard, { borderLeftColor: sc }]}>
                    <View style={styles.edgeHeader}>
                      <Text style={styles.edgeNames} numberOfLines={1}>
                        {fromInf.displayName}
                        <Text style={styles.edgeArrow}> ↔ </Text>
                        {toInf.displayName}
                      </Text>
                      <View style={[styles.strengthBadge, { backgroundColor: sc + '22', borderColor: sc }]}>
                        <Text style={[styles.strengthText, { color: sc }]}>{STRENGTH_LABEL[edge.strength]}</Text>
                      </View>
                    </View>
                    <Text style={styles.edgeType}>{edge.connectionType}</Text>
                    <Text style={styles.edgeDesc}>{edge.description}</Text>
                    <View style={styles.confidenceRow}>
                      <Text style={styles.confidenceLabel}>Εμπιστοσύνη:</Text>
                      <View style={styles.confidenceBarBg}>
                        <View style={[styles.confidenceBarFill, { width: `${edge.confidence}%` as any, backgroundColor: sc }]} />
                      </View>
                      <Text style={[styles.confidencePct, { color: sc }]}>{edge.confidence}%</Text>
                    </View>
                  </View>
                );
              })
          )}

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              * Οι συνδέσεις είναι εκτιμήσεις ΤΝ βάσει δημόσιων δεδομένων. Δεν αποτελούν επιβεβαιωμένα γεγονότα.
            </Text>
          </View>
        </>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <View style={styles.sectionTitleRow}>
      <View style={styles.sectionAccent} />
      <Text style={styles.sectionTitleText}>{title}</Text>
    </View>
  );
}

function StatChip({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.statChip}>
      <Text style={[styles.statValue, color ? { color } : {}]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 14, paddingBottom: 40 },

  // Header
  headerBlock: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.bgCard,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 14,
  },
  headerAccent: { width: 3, backgroundColor: colors.blue, borderRadius: 1, alignSelf: 'stretch' },
  headerTitle: { fontSize: 14, fontWeight: '800', color: colors.text, marginBottom: 6 },
  headerSub: { fontSize: 12, color: colors.textMuted, lineHeight: 18 },

  // Section title
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 14,
  },
  sectionAccent: { width: 3, height: 12, backgroundColor: colors.blue, borderRadius: 1, marginRight: 8 },
  sectionTitleText: {
    fontSize: 10, fontWeight: '700', color: colors.blueLight,
    textTransform: 'uppercase', letterSpacing: 1.2,
  },

  // Select rows
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 3,
    padding: 10,
    marginBottom: 6,
  },
  selectRowOn: { borderColor: colors.blue, backgroundColor: colors.blueDeep },
  checkbox: {
    width: 22, height: 22, borderRadius: 2,
    borderWidth: 1.5, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: colors.blue, borderColor: colors.blue },
  checkmark: { fontSize: 13, color: colors.text, fontWeight: '800' },
  selName: { fontSize: 14, fontWeight: '600', color: colors.text },
  selVerified: { fontSize: 11, color: colors.blue },
  selMeta: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  scoreDot: {
    width: 34, height: 34, borderRadius: 3,
    alignItems: 'center', justifyContent: 'center',
  },
  scoreDotText: { fontSize: 12, fontWeight: '800' },

  // Analyze button
  analyzeBtn: {
    backgroundColor: colors.gold,
    borderRadius: 3,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  analyzeBtnText: { fontSize: 15, fontWeight: '800', color: colors.bgCard, letterSpacing: 0.5 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  // Summary
  summaryBlock: {
    backgroundColor: colors.bgCard,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    borderLeftColor: colors.blue,
    padding: 14,
  },
  summaryText: { fontSize: 14, color: colors.text, lineHeight: 21 },

  // Stats row
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  statChip: {
    flex: 1, backgroundColor: colors.bgCard,
    borderRadius: 3, borderWidth: 1, borderColor: colors.border,
    padding: 10, alignItems: 'center',
  },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 9, color: colors.textMuted, textTransform: 'uppercase', marginTop: 2 },

  // Insights
  insightsBlock: {
    backgroundColor: colors.bgCard,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  insightRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  insightDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: colors.blue, marginTop: 6 },
  insightText: { flex: 1, fontSize: 13, color: colors.text, lineHeight: 19 },

  // Edge cards
  edgeCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    padding: 12,
    marginBottom: 8,
  },
  edgeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  edgeNames: { flex: 1, fontSize: 13, fontWeight: '700', color: colors.text },
  edgeArrow: { color: colors.blue },
  strengthBadge: {
    borderRadius: 3, borderWidth: 1,
    paddingHorizontal: 7, paddingVertical: 2,
    marginLeft: 6,
  },
  strengthText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  edgeType: { fontSize: 11, color: colors.blueLight, fontWeight: '700', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  edgeDesc: { fontSize: 12, color: colors.textSub, lineHeight: 18, marginBottom: 8 },
  confidenceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  confidenceLabel: { fontSize: 9, color: colors.textDim, textTransform: 'uppercase' },
  confidenceBarBg: { flex: 1, height: 3, backgroundColor: colors.bgInput, borderRadius: 2, overflow: 'hidden' },
  confidenceBarFill: { height: '100%', borderRadius: 2 },
  confidencePct: { fontSize: 10, fontWeight: '700', minWidth: 28, textAlign: 'right' },

  // Empty / disclaimer
  emptyBox: {
    backgroundColor: colors.bgCard,
    borderRadius: 3, borderWidth: 1, borderColor: colors.border,
    padding: 24, alignItems: 'center',
  },
  emptyText: { fontSize: 14, color: colors.textMuted, fontWeight: '600' },
  emptyHint: { fontSize: 12, color: colors.textDim, marginTop: 4 },
  disclaimer: { marginTop: 14, padding: 10 },
  disclaimerText: { fontSize: 10, color: colors.textDim, lineHeight: 15, textAlign: 'center' },
});
