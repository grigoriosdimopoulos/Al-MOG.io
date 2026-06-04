import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme';
import InfluencerCard from '../components/InfluencerCard';
import { getBookmarks, toggleBookmark } from '../storage';
import type { RootStackParamList, RankedInfluencer } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function BookmarksScreen() {
  const nav = useNavigation<Nav>();
  const [bookmarks, setBookmarks] = useState<RankedInfluencer[]>([]);

  useFocusEffect(
    useCallback(() => {
      getBookmarks().then(setBookmarks);
    }, []),
  );

  async function remove(influencer: RankedInfluencer) {
    await toggleBookmark(influencer);
    setBookmarks(prev => prev.filter(b => b.id !== influencer.id));
  }

  function confirmRemove(influencer: RankedInfluencer) {
    Alert.alert('Remove bookmark?', influencer.displayName, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => remove(influencer) },
    ]);
  }

  return (
    <View style={styles.root}>
      {bookmarks.length > 0 && (
        <View style={styles.header}>
          <Text style={styles.count}>{bookmarks.length} αποθηκευμένες επιρροές</Text>
          {bookmarks.length >= 2 && (
            <TouchableOpacity
              onPress={() => nav.navigate('NetworkAnalysis', { influencers: bookmarks })}
              style={styles.networkBtn}
            >
              <Text style={styles.networkBtnText}>Ανάλυση Δικτύου</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      <FlatList
        data={bookmarks}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <View>
            <InfluencerCard
              influencer={item}
              rank={index + 1}
              onPress={() => nav.navigate('Detail', { influencer: item })}
            />
            <TouchableOpacity onPress={() => confirmRemove(item)} style={styles.removeBtn}>
              <Text style={styles.removeBtnText}>Remove bookmark</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>☆</Text>
            <Text style={styles.emptyTitle}>No saved influencers</Text>
            <Text style={styles.emptyText}>
              Tap the Save button on any influencer profile to bookmark them here.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  count: { flex: 1, fontSize: 13, color: colors.textMuted },
  networkBtn: {
    backgroundColor: colors.blue,
    borderRadius: 3,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  networkBtnText: { fontSize: 12, fontWeight: '700', color: colors.text },
  list: { padding: 10, paddingBottom: 30 },
  removeBtn: { marginTop: -4, marginBottom: 10, alignItems: 'flex-end', paddingRight: 4 },
  removeBtnText: { fontSize: 11, color: colors.danger },
  empty: { flex: 1, alignItems: 'center', padding: 60 },
  emptyIcon: { fontSize: 48, color: colors.textDim, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 8 },
  emptyText: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
});
