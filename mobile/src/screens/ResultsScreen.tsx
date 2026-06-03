import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, formatNumber, scoreColor } from '../theme';
import InfluencerCard from '../components/InfluencerCard';
import { exportCSV, exportJSON } from '../services/export';
import type { RootStackParamList, SortKey, TierFilter, RankedInfluencer } from '../types';

type Route = RouteProp<RootStackParamList, 'Results'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ResultsScreen() {
  const { params: { record } } = useRoute<Route>();
  const nav = useNavigation<Nav>();
  const [sort, setSort] = useState<SortKey>('score');
  const [tierFilter, setTierFilter] = useState<TierFilter>('all');
  const [exporting, setExporting] = useState(false);

  const results = useMemo(() => {
    let list = record.results;
    if (tierFilter !== 'all') list = list.filter(r => r.tier === tierFilter);
    return [...list].sort((a, b) => {
      if (sort === 'score') return b.relevanceScore - a.relevanceScore;
      if (sort === 'followers') return b.followers - a.followers;
      return b.engagementRate - a.engagementRate;
    });
  }, [record.results, sort, tierFilter]);

  const stats = useMemo(() => ({
    total: results.length,
    avgScore: results.length ? Math.round(results.reduce((s, r) => s + r.relevanceScore, 0) / results.length) : 0,
    totalReach: results.reduce((s, r) => s + r.reachEstimate, 0),
    high: results.filter(r => r.tier === 'high').length,
  }), [results]);

  async function doExport(format: 'csv' | 'json') {
    setExporting(true);
    try {
      if (format === 'csv') await exportCSV(results, record.params);
      else await exportJSON(results, record.params);
    } catch (e: any) {
      Alert.alert('Export failed', e.message);
    } finally {
      setExporting(false);
    }
  }

  return (
    <View style={styles.root}>
      {/* Stats bar */}
      <View style={styles.statsBar}>
        <StatItem label="Results" value={stats.total.toString()} />
        <StatItem label="Avg Score" value={stats.avgScore.toString()} color={scoreColor(stats.avgScore)} />
        <StatItem label="High Tier" value={stats.high.toString()} color={colors.success} />
        <StatItem label="Total Reach" value={formatNumber(stats.totalReach)} />
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.ctrlGroup}>
          <Text style={styles.ctrlLabel}>Sort:</Text>
          {(['score', 'followers', 'engagement'] as SortKey[]).map(k => (
            <TouchableOpacity key={k} onPress={() => setSort(k)} style={[styles.pill, sort === k && styles.pillOn]}>
              <Text style={[styles.pillText, sort === k && styles.pillTextOn]}>{k}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.ctrlGroup}>
          <Text style={styles.ctrlLabel}>Tier:</Text>
          {(['all', 'high', 'medium', 'low'] as TierFilter[]).map(t => (
            <TouchableOpacity key={t} onPress={() => setTierFilter(t)} style={[styles.pill, tierFilter === t && styles.pillOn]}>
              <Text style={[styles.pillText, tierFilter === t && styles.pillTextOn]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Export */}
      <View style={styles.exportRow}>
        <Text style={styles.aiLabel}>
          {record.aiMode === 'anthropic' ? '🤖 Claude AI' : '📱 Local LLM'} · {(record.durationMs / 1000).toFixed(1)}s
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity onPress={() => doExport('csv')} style={styles.exportBtn} disabled={exporting}>
            <Text style={styles.exportBtnText}>CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => doExport('json')} style={styles.exportBtn} disabled={exporting}>
            <Text style={styles.exportBtnText}>JSON</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={results}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <InfluencerCard
            influencer={item}
            rank={index + 1}
            onPress={() => nav.navigate('Detail', { influencer: item })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No results for this filter.</Text>
          </View>
        }
      />
    </View>
  );
}

function StatItem({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, color ? { color } : {}]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 10,
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 10, color: colors.textMuted, textTransform: 'uppercase' },
  controls: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 6,
  },
  ctrlGroup: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  ctrlLabel: { fontSize: 11, color: colors.textMuted, marginRight: 2, width: 36 },
  pill: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgCard,
  },
  pillOn: { borderColor: colors.gold, backgroundColor: colors.bgInput },
  pillText: { fontSize: 11, color: colors.textMuted, textTransform: 'capitalize' },
  pillTextOn: { color: colors.gold, fontWeight: '700' },
  exportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  aiLabel: { fontSize: 11, color: colors.textMuted },
  exportBtn: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 6,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgCard,
  },
  exportBtnText: { fontSize: 12, color: colors.gold, fontWeight: '600' },
  list: { padding: 10, paddingBottom: 20 },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: colors.textMuted, fontSize: 15 },
});
