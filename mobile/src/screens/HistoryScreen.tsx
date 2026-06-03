import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme';
import { getHistory, deleteHistoryRecord, clearHistory } from '../storage';
import type { RootStackParamList, SearchRecord } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HistoryScreen() {
  const nav = useNavigation<Nav>();
  const [history, setHistory] = useState<SearchRecord[]>([]);

  useFocusEffect(
    useCallback(() => {
      getHistory().then(setHistory);
    }, []),
  );

  async function remove(id: string) {
    await deleteHistoryRecord(id);
    setHistory(prev => prev.filter(r => r.id !== id));
  }

  function confirmClear() {
    Alert.alert('Clear all history?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear all',
        style: 'destructive',
        onPress: async () => {
          await clearHistory();
          setHistory([]);
        },
      },
    ]);
  }

  function replaySearch(record: SearchRecord) {
    nav.navigate('Results', { record });
  }

  return (
    <View style={styles.root}>
      {history.length > 0 && (
        <View style={styles.header}>
          <Text style={styles.count}>{history.length} past search{history.length !== 1 ? 'es' : ''}</Text>
          <TouchableOpacity onPress={confirmClear}>
            <Text style={styles.clearBtn}>Clear all</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={history}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <HistoryItem record={item} onReplay={() => replaySearch(item)} onDelete={() => remove(item.id)} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📜</Text>
            <Text style={styles.emptyTitle}>No search history</Text>
            <Text style={styles.emptyText}>Past searches appear here. Run a search to get started.</Text>
          </View>
        }
      />
    </View>
  );
}

function HistoryItem({
  record,
  onReplay,
  onDelete,
}: {
  record: SearchRecord;
  onReplay: () => void;
  onDelete: () => void;
}) {
  const date = new Date(record.timestamp);
  const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.keywords} numberOfLines={1}>
            {record.params.keywords.join(', ')}
          </Text>
          <Text style={styles.meta}>
            {dateStr} · {record.results.length} results · {record.aiMode === 'anthropic' ? '🤖 Claude' : '📱 Local'}
          </Text>
        </View>
        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
          <Text style={styles.deleteBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tagsRow}>
        {record.params.platforms.map(p => (
          <View key={p} style={styles.tag}>
            <Text style={styles.tagText}>{p}</Text>
          </View>
        ))}
        {record.params.location ? (
          <View style={styles.tag}>
            <Text style={styles.tagText}>📍 {record.params.location}</Text>
          </View>
        ) : null}
        {record.params.politicalTopics.slice(0, 2).map(t => (
          <View key={t} style={styles.tag}>
            <Text style={styles.tagText}>{t}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity onPress={onReplay} style={styles.replayBtn}>
        <Text style={styles.replayBtnText}>View results →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  count: { fontSize: 13, color: colors.textMuted },
  clearBtn: { fontSize: 13, color: colors.danger },
  list: { padding: 10, paddingBottom: 30 },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 8,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  keywords: { fontSize: 15, fontWeight: '700', color: colors.text },
  meta: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  deleteBtn: { padding: 4 },
  deleteBtnText: { color: colors.textDim, fontSize: 14 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 10 },
  tag: {
    backgroundColor: colors.bgInput,
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagText: { fontSize: 10, color: colors.textMuted },
  replayBtn: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    alignItems: 'flex-end',
  },
  replayBtnText: { fontSize: 13, color: colors.gold, fontWeight: '600' },
  empty: { flex: 1, alignItems: 'center', padding: 60 },
  emptyIcon: { fontSize: 48, color: colors.textDim, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 8 },
  emptyText: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
});
