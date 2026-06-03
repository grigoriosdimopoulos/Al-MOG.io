import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Switch,
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
    Alert.alert('Saved', 'Settings have been saved.');
  }

  async function testAnthropicKey() {
    if (!settings.anthropicApiKey.trim()) {
      Alert.alert('No key', 'Enter an Anthropic API key first.');
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
        Alert.alert('✓ Key is valid', 'Your Anthropic API key works correctly.');
      } else {
        const body = await resp.json();
        Alert.alert('Key error', body.error?.message ?? `HTTP ${resp.status}`);
      }
    } catch (e: any) {
      Alert.alert('Connection error', e.message);
    }
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>

      {/* AI Mode */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Mode</Text>
        <View style={styles.card}>
          <Text style={styles.cardDesc}>
            Choose how influencer analysis is performed. Anthropic uses Claude AI in the cloud. Local runs an on-device LLM with no internet required.
          </Text>
          <View style={styles.modeRow}>
            {(['anthropic', 'local'] as AIMode[]).map(mode => (
              <TouchableOpacity
                key={mode}
                onPress={() => update({ aiMode: mode })}
                style={[styles.modeBtn, settings.aiMode === mode && styles.modeBtnActive]}
              >
                <Text style={styles.modeIcon}>{mode === 'anthropic' ? '🤖' : '📱'}</Text>
                <Text style={[styles.modeBtnText, settings.aiMode === mode && styles.modeBtnTextActive]}>
                  {mode === 'anthropic' ? 'Claude AI (Anthropic)' : 'Local LLM (On-device)'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Anthropic API */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Anthropic API Key</Text>
        <View style={styles.card}>
          <Text style={styles.cardDesc}>
            Your personal Anthropic API key. Used only when AI Mode is set to Claude AI.
            Get a key at console.anthropic.com.
          </Text>
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
          <TouchableOpacity onPress={testAnthropicKey} style={styles.testBtn}>
            <Text style={styles.testBtnText}>Test Key</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Local model */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Local LLM Model</Text>
        <View style={styles.card}>
          {settings.localModelName ? (
            <View style={styles.modelRow}>
              <Text style={styles.modelActive}>✓ {settings.localModelName}</Text>
              <TouchableOpacity onPress={() => update({ localModelPath: null, localModelName: null })}>
                <Text style={styles.modelRemove}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.cardDesc}>No model selected. Download one to use offline AI analysis.</Text>
          )}
          <TouchableOpacity onPress={() => nav.navigate('ModelManager')} style={styles.testBtn}>
            <Text style={styles.testBtnText}>Manage Models →</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Platform APIs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Platform API Keys (Optional)</Text>
        <View style={styles.card}>
          <Text style={styles.cardDesc}>
            Provide API keys to fetch real data. Without them, the app uses generated representative data.
          </Text>
          <Text style={styles.inputLabel}>YouTube Data API v3 Key</Text>
          <TextInput
            style={styles.input}
            placeholder="AIza..."
            placeholderTextColor={colors.textDim}
            value={settings.youtubeApiKey}
            onChangeText={v => update({ youtubeApiKey: v })}
            autoCorrect={false}
            autoCapitalize="none"
          />
          <Text style={[styles.inputLabel, { marginTop: 12 }]}>Twitter / X Bearer Token</Text>
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
        </View>
      </View>

      {/* Search settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Search Settings</Text>
        <View style={styles.card}>
          <Text style={styles.inputLabel}>Max results per search</Text>
          <View style={styles.countRow}>
            {[10, 25, 50, 100].map(n => (
              <TouchableOpacity
                key={n}
                onPress={() => update({ resultsPerSearch: n })}
                style={[styles.countBtn, settings.resultsPerSearch === n && styles.countBtnActive]}
              >
                <Text style={[styles.countBtnText, settings.resultsPerSearch === n && { color: colors.gold }]}>{n}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Save */}
      {dirty && (
        <TouchableOpacity onPress={save} style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>Save Settings</Text>
        </TouchableOpacity>
      )}

      <View style={styles.about}>
        <Text style={styles.aboutText}>Al-MOG Political Influencer Intelligence</Text>
        <Text style={styles.aboutText}>Version 2.0</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 50 },
  section: { marginBottom: 22 },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: colors.gold,
    letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10,
  },
  card: {
    backgroundColor: colors.bgCard, borderRadius: 10,
    borderWidth: 1, borderColor: colors.border, padding: 14,
  },
  cardDesc: { fontSize: 13, color: colors.textMuted, lineHeight: 19, marginBottom: 12 },
  modeRow: { gap: 8 },
  modeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.bgInput,
  },
  modeBtnActive: { borderColor: colors.gold },
  modeIcon: { fontSize: 20 },
  modeBtnText: { fontSize: 14, color: colors.textMuted, fontWeight: '600' },
  modeBtnTextActive: { color: colors.gold },
  input: {
    backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.border,
    borderRadius: 8, color: colors.text, paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, marginBottom: 8,
  },
  inputLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 6 },
  testBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 6, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.bgInput, marginTop: 4,
  },
  testBtnText: { fontSize: 13, color: colors.gold, fontWeight: '600' },
  modelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  modelActive: { fontSize: 14, color: colors.success, fontWeight: '600' },
  modelRemove: { fontSize: 12, color: colors.danger },
  countRow: { flexDirection: 'row', gap: 8 },
  countBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 6, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgInput,
  },
  countBtnActive: { borderColor: colors.gold },
  countBtnText: { fontSize: 15, fontWeight: '700', color: colors.textMuted },
  saveBtn: {
    backgroundColor: colors.gold, borderRadius: 10,
    paddingVertical: 15, alignItems: 'center', marginBottom: 20,
  },
  saveBtnText: { fontSize: 16, fontWeight: '800', color: colors.bg },
  about: { alignItems: 'center', gap: 4, marginTop: 10 },
  aboutText: { fontSize: 12, color: colors.textDim },
});
