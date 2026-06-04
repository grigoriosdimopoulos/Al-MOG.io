import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme';
import { getSettings, saveSettings, DEFAULT_SETTINGS } from '../storage';
import type { RootStackParamList, AppSettings, AIMode } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function SettingsScreen() {
  const nav = useNavigation<Nav>();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [dirty, setDirty] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getSettings().then(s => { setSettings(s); setDirty(false); });
    }, []),
  );

  function update(partial: Partial<AppSettings>) {
    setSettings(prev => ({ ...prev, ...partial }));
    setDirty(true);
  }

  async function save() {
    await saveSettings(settings);
    setDirty(false);
    Alert.alert('Αποθηκεύτηκε', 'Οι ρυθμίσεις αποθηκεύτηκαν.');
  }

  async function testAnthropicKey() {
    if (!settings.anthropicApiKey.trim()) {
      Alert.alert('Δεν υπάρχει κλειδί', 'Εισάγετε πρώτα ένα κλειδί Anthropic API.');
      return;
    }
    try {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': settings.anthropicApiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Say "ok"' }],
        }),
      });
      if (resp.ok) {
        Alert.alert('Επαλήθευση επιτυχής', 'Το κλειδί Anthropic API λειτουργεί σωστά.');
      } else {
        const body = await resp.json();
        Alert.alert('Σφάλμα κλειδιού', body.error?.message ?? `HTTP ${resp.status}`);
      }
    } catch (e: any) {
      Alert.alert('Σφάλμα σύνδεσης', e.message);
    }
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>

      {/* ── AI MODE ─────────────────────────────────── */}
      <SettingBlock title="Λειτουργία ΤΝ / AI Mode">
        <Text style={styles.hint}>
          Επιλέξτε πώς εκτελείται η ανάλυση επιρροών. Το Anthropic χρησιμοποιεί Claude AI μέσω cloud. Το Τοπικό εκτελεί LLM στη συσκευή.
        </Text>
        <View style={styles.modeRow}>
          {(['anthropic', 'local'] as AIMode[]).map(mode => (
            <TouchableOpacity
              key={mode}
              onPress={() => update({ aiMode: mode })}
              style={[styles.modeBtn, settings.aiMode === mode && styles.modeBtnActive]}
            >
              <View style={[styles.modeDot, settings.aiMode === mode && styles.modeDotActive]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.modeBtnText, settings.aiMode === mode && styles.modeBtnTextActive]}>
                  {mode === 'anthropic' ? 'Claude AI (Anthropic)' : 'Τοπικό LLM (On-device)'}
                </Text>
                <Text style={styles.modeSubText}>
                  {mode === 'anthropic' ? 'Απαιτεί σύνδεση internet + API key' : 'Εκτελείται χωρίς internet'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </SettingBlock>

      {/* ── ANTHROPIC API KEY ─────────────────────── */}
      <SettingBlock title="Κλειδί Anthropic API">
        <Text style={styles.hint}>
          Προσωπικό κλειδί Anthropic API. Χρησιμοποιείται μόνο στη λειτουργία Claude AI.
        </Text>
        <Text style={styles.fieldLabel}>API Key</Text>
        <TextInput
          style={styles.input}
          placeholder="sk-ant-..."
          placeholderTextColor={colors.textDim}
          value={settings.anthropicApiKey}
          onChangeText={v => update({ anthropicApiKey: v })}
          secureTextEntry
          autoCorrect={false}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={testAnthropicKey} style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>Δοκιμή Κλειδιού</Text>
        </TouchableOpacity>
      </SettingBlock>

      {/* ── LOCAL MODEL ───────────────────────────── */}
      <SettingBlock title="Τοπικό Μοντέλο LLM">
        {settings.localModelName ? (
          <View style={styles.modelRow}>
            <View style={styles.modelActiveDot} />
            <Text style={styles.modelActive}>{settings.localModelName}</Text>
            <TouchableOpacity onPress={() => update({ localModelPath: null, localModelName: null })} style={styles.removeBtn}>
              <Text style={styles.removeBtnText}>Αφαίρεση</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.hint}>Δεν έχει επιλεγεί μοντέλο. Κατεβάστε ένα για offline ανάλυση.</Text>
        )}
        <TouchableOpacity onPress={() => nav.navigate('ModelManager')} style={[styles.actionBtn, { marginTop: 10 }]}>
          <Text style={styles.actionBtnText}>Διαχείριση Μοντέλων</Text>
        </TouchableOpacity>
      </SettingBlock>

      {/* ── PLATFORM API KEYS ─────────────────────── */}
      <SettingBlock title="Κλειδιά Πλατφορμών API (Προαιρετικά)">
        <Text style={styles.hint}>
          Παρέχετε κλειδιά API για πραγματικά δεδομένα. Χωρίς αυτά η εφαρμογή χρησιμοποιεί παραγόμενα δεδομένα.
        </Text>
        <Text style={styles.fieldLabel}>YouTube Data API v3 Key</Text>
        <TextInput
          style={styles.input}
          placeholder="AIza..."
          placeholderTextColor={colors.textDim}
          value={settings.youtubeApiKey}
          onChangeText={v => update({ youtubeApiKey: v })}
          autoCorrect={false}
          autoCapitalize="none"
        />
        <Text style={[styles.fieldLabel, { marginTop: 10 }]}>Twitter / X Bearer Token</Text>
        <TextInput
          style={styles.input}
          placeholder="AAAA..."
          placeholderTextColor={colors.textDim}
          value={settings.twitterBearerToken}
          onChangeText={v => update({ twitterBearerToken: v })}
          autoCorrect={false}
          autoCapitalize="none"
          secureTextEntry
        />
        <Text style={[styles.fieldLabel, { marginTop: 10 }]}>SerpAPI Key (Google Search)</Text>
        <Text style={[styles.hint, { marginBottom: 6 }]}>
          Ενεργοποιεί αναζήτηση πραγματικών προφίλ μέσω Google. Λάβετε δωρεάν κλειδί από serpapi.com.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="serpapi_..."
          placeholderTextColor={colors.textDim}
          value={settings.serpApiKey}
          onChangeText={v => update({ serpApiKey: v })}
          autoCorrect={false}
          autoCapitalize="none"
          secureTextEntry
        />
        {settings.serpApiKey.trim().length > 0 && (
          <View style={styles.serpNote}>
            <View style={styles.serpDot} />
            <Text style={styles.serpNoteText}>Ενεργό — τα αποτελέσματα θα προέρχονται από πραγματικά Google αποτελέσματα</Text>
          </View>
        )}
      </SettingBlock>

      {/* ── SEARCH SETTINGS ───────────────────────── */}
      <SettingBlock title="Παράμετροι Αναζήτησης">
        <Text style={styles.fieldLabel}>Μέγιστα αποτελέσματα ανά αναζήτηση</Text>
        <View style={styles.countRow}>
          {[10, 25, 50, 100].map(n => (
            <TouchableOpacity
              key={n}
              onPress={() => update({ resultsPerSearch: n })}
              style={[styles.countBtn, settings.resultsPerSearch === n && styles.countBtnActive]}
            >
              <Text style={[styles.countBtnText, settings.resultsPerSearch === n && { color: colors.blueLight }]}>{n}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </SettingBlock>

      {/* ── SAVE BUTTON ───────────────────────────── */}
      {dirty && (
        <TouchableOpacity onPress={save} style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>Αποθήκευση Ρυθμίσεων</Text>
        </TouchableOpacity>
      )}

      <View style={styles.footer}>
        <View style={styles.footerLine} />
        <Text style={styles.footerText}>Al-MOG — Σύστημα Ανάλυσης Πολιτικών Επιρροών</Text>
        <Text style={styles.footerText}>v2.0  ·  Εμπιστευτικό Λογισμικό</Text>
      </View>

    </ScrollView>
  );
}

function SettingBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.block}>
      <View style={styles.blockHeader}>
        <View style={styles.blockAccent} />
        <Text style={styles.blockTitle}>{title}</Text>
      </View>
      <View style={styles.blockBody}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 14, paddingBottom: 50 },

  // Section block
  block: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 3,
    backgroundColor: colors.bgCard,
    overflow: 'hidden',
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSection,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  blockAccent: { width: 3, height: 14, backgroundColor: colors.blue, borderRadius: 1, marginRight: 10 },
  blockTitle: { fontSize: 10, fontWeight: '700', color: colors.blueLight, letterSpacing: 1.2, textTransform: 'uppercase' },
  blockBody: { padding: 14 },

  hint: { fontSize: 12, color: colors.textMuted, lineHeight: 18, marginBottom: 12 },
  fieldLabel: { fontSize: 10, color: colors.textMuted, marginBottom: 5, letterSpacing: 0.4, textTransform: 'uppercase' },

  // AI Mode
  modeRow: { gap: 8 },
  modeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, borderRadius: 3, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.bgInput,
  },
  modeBtnActive: { borderColor: colors.blue, backgroundColor: colors.blueDeep },
  modeDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: colors.border },
  modeDotActive: { backgroundColor: colors.blue, borderColor: colors.blue },
  modeBtnText: { fontSize: 14, color: colors.textMuted, fontWeight: '600' },
  modeBtnTextActive: { color: colors.text },
  modeSubText: { fontSize: 11, color: colors.textDim, marginTop: 2 },

  // Input
  input: {
    backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.border,
    borderRadius: 3, color: colors.text, paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, marginBottom: 4,
  },

  // Buttons
  actionBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 3, borderWidth: 1, borderColor: colors.borderActive,
    backgroundColor: colors.bgInput,
  },
  actionBtnText: { fontSize: 13, color: colors.blueLight, fontWeight: '600' },

  // Model
  modelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  modelActiveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success, marginRight: 8 },
  modelActive: { flex: 1, fontSize: 13, color: colors.success, fontWeight: '600' },
  removeBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  removeBtnText: { fontSize: 12, color: colors.danger },

  // SerpAPI note
  serpNote: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 },
  serpDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },
  serpNoteText: { fontSize: 11, color: colors.success, flex: 1 },

  // Count row
  countRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  countBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 3, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgInput,
  },
  countBtnActive: { borderColor: colors.blue, backgroundColor: colors.blueDeep },
  countBtnText: { fontSize: 15, fontWeight: '700', color: colors.textMuted },

  // Save
  saveBtn: {
    backgroundColor: colors.gold, borderRadius: 3,
    paddingVertical: 15, alignItems: 'center', marginBottom: 16,
  },
  saveBtnText: { fontSize: 15, fontWeight: '800', color: colors.bgCard, letterSpacing: 0.5 },

  // Footer
  footer: { alignItems: 'center', marginTop: 10, gap: 4 },
  footerLine: { width: 40, height: 1, backgroundColor: colors.border, marginBottom: 8 },
  footerText: { fontSize: 11, color: colors.textDim, letterSpacing: 0.3 },
});
