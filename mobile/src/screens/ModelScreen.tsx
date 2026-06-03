import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme';
import { getSettings, saveSettings } from '../storage';
import type { LocalModel, AppSettings } from '../types';

const RECOMMENDED_MODELS: LocalModel[] = [
  {
    name: 'Llama 3.2 1B (Q4_K_M)',
    filename: 'llama-3.2-1b-instruct-q4_k_m.gguf',
    sizeGB: 0.75,
    url: 'https://huggingface.co/bartowski/Llama-3.2-1B-Instruct-GGUF/resolve/main/Llama-3.2-1B-Instruct-Q4_K_M.gguf',
    description: 'Fast, minimal RAM. Good for quick analysis. Recommended for phones with 3GB+ RAM.',
  },
  {
    name: 'Llama 3.2 3B (Q4_K_M)',
    filename: 'llama-3.2-3b-instruct-q4_k_m.gguf',
    sizeGB: 2.0,
    url: 'https://huggingface.co/bartowski/Llama-3.2-3B-Instruct-GGUF/resolve/main/Llama-3.2-3B-Instruct-Q4_K_M.gguf',
    description: 'Better analysis quality. Requires 4GB+ RAM. Slower on older devices.',
  },
  {
    name: 'Phi-3.5 Mini (Q4_K_M)',
    filename: 'phi-3.5-mini-instruct-q4_k_m.gguf',
    sizeGB: 2.4,
    url: 'https://huggingface.co/bartowski/Phi-3.5-mini-instruct-GGUF/resolve/main/Phi-3.5-mini-instruct-Q4_K_M.gguf',
    description: 'Strong reasoning. Best quality of the three options. Needs 6GB+ RAM.',
  },
];

type DownloadState = 'idle' | 'downloading' | 'done' | 'error';

interface ModelStatus {
  state: DownloadState;
  progress: number;
  path?: string;
  error?: string;
}

export default function ModelScreen() {
  const [statuses, setStatuses] = useState<Record<string, ModelStatus>>({});
  const [activeModel, setActiveModel] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadInitial();
    }, []),
  );

  async function loadInitial() {
    const s = await getSettings();
    setSettings(s);
    setActiveModel(s.localModelName);

    const newStatuses: Record<string, ModelStatus> = {};
    for (const m of RECOMMENDED_MODELS) {
      const path = `${FileSystem.documentDirectory}${m.filename}`;
      const info = await FileSystem.getInfoAsync(path);
      newStatuses[m.filename] = info.exists
        ? { state: 'done', progress: 1, path }
        : { state: 'idle', progress: 0 };
    }
    setStatuses(newStatuses);
  }

  function setStatus(filename: string, update: Partial<ModelStatus>) {
    setStatuses(prev => ({
      ...prev,
      [filename]: { ...prev[filename], ...update },
    }));
  }

  async function download(model: LocalModel) {
    setStatus(model.filename, { state: 'downloading', progress: 0 });
    const destPath = `${FileSystem.documentDirectory}${model.filename}`;

    const cb = FileSystem.createDownloadResumable(
      model.url,
      destPath,
      {},
      ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
        const pct = totalBytesExpectedToWrite > 0
          ? totalBytesWritten / totalBytesExpectedToWrite
          : 0;
        setStatus(model.filename, { progress: pct });
      },
    );

    try {
      const result = await cb.downloadAsync();
      if (result?.uri) {
        setStatus(model.filename, { state: 'done', progress: 1, path: result.uri });
      }
    } catch (e: any) {
      setStatus(model.filename, { state: 'error', error: e.message });
      Alert.alert('Download failed', e.message);
    }
  }

  async function deleteModel(model: LocalModel) {
    Alert.alert('Delete model?', `This will remove ${model.name} (${model.sizeGB} GB) from storage.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const path = `${FileSystem.documentDirectory}${model.filename}`;
          await FileSystem.deleteAsync(path, { idempotent: true });
          setStatus(model.filename, { state: 'idle', progress: 0, path: undefined });
          if (activeModel === model.name && settings) {
            const updated = { ...settings, localModelPath: null, localModelName: null };
            await saveSettings(updated);
            setSettings(updated);
            setActiveModel(null);
          }
        },
      },
    ]);
  }

  async function selectModel(model: LocalModel, path: string) {
    if (!settings) return;
    const updated = { ...settings, localModelPath: path, localModelName: model.name };
    await saveSettings(updated);
    setSettings(updated);
    setActiveModel(model.name);
    Alert.alert('Model selected', `${model.name} is now the active local model.`);
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Download a GGUF model to enable on-device AI analysis without an internet connection.
        </Text>
      </View>

      <FlatList
        data={RECOMMENDED_MODELS}
        keyExtractor={item => item.filename}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const st = statuses[item.filename] ?? { state: 'idle', progress: 0 };
          const isActive = activeModel === item.name;
          return (
            <ModelCard
              model={item}
              status={st}
              isActive={isActive}
              onDownload={() => download(item)}
              onDelete={() => deleteModel(item)}
              onSelect={() => st.path && selectModel(item, st.path)}
            />
          );
        }}
      />
    </View>
  );
}

function ModelCard({
  model, status, isActive, onDownload, onDelete, onSelect,
}: {
  model: LocalModel;
  status: ModelStatus;
  isActive: boolean;
  onDownload: () => void;
  onDelete: () => void;
  onSelect: () => void;
}) {
  const isDone = status.state === 'done';
  const isDownloading = status.state === 'downloading';

  return (
    <View style={[styles.card, isActive && styles.cardActive]}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.modelName}>{model.name}</Text>
          <Text style={styles.modelSize}>{model.sizeGB} GB</Text>
        </View>
        {isActive && (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>ACTIVE</Text>
          </View>
        )}
      </View>

      <Text style={styles.modelDesc}>{model.description}</Text>

      {isDownloading && (
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.round(status.progress * 100)}%` }]} />
          <Text style={styles.progressText}>{Math.round(status.progress * 100)}%</Text>
        </View>
      )}

      <View style={styles.btnRow}>
        {!isDone && !isDownloading && (
          <TouchableOpacity onPress={onDownload} style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>↓ Download</Text>
          </TouchableOpacity>
        )}
        {isDone && !isActive && (
          <TouchableOpacity onPress={onSelect} style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>Set Active</Text>
          </TouchableOpacity>
        )}
        {isDone && (
          <TouchableOpacity onPress={onDelete} style={[styles.actionBtn, styles.deleteBtn]}>
            <Text style={[styles.actionBtnText, { color: colors.danger }]}>Delete</Text>
          </TouchableOpacity>
        )}
        {isDownloading && (
          <Text style={styles.downloadingText}>Downloading…</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  headerText: { fontSize: 13, color: colors.textMuted, lineHeight: 19 },
  list: { padding: 12, paddingBottom: 30 },
  card: {
    backgroundColor: colors.bgCard, borderRadius: 10,
    borderWidth: 1, borderColor: colors.border,
    padding: 14, marginBottom: 10,
  },
  cardActive: { borderColor: colors.success },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  modelName: { fontSize: 15, fontWeight: '700', color: colors.text },
  modelSize: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  activeBadge: {
    backgroundColor: colors.successBg, borderRadius: 4,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: colors.success,
  },
  activeBadgeText: { fontSize: 10, fontWeight: '700', color: colors.success },
  modelDesc: { fontSize: 13, color: colors.textMuted, lineHeight: 18, marginBottom: 12 },
  progressBar: {
    height: 6, backgroundColor: colors.bgInput, borderRadius: 3,
    marginBottom: 10, overflow: 'hidden', position: 'relative',
  },
  progressFill: { height: '100%', backgroundColor: colors.gold, borderRadius: 3 },
  progressText: { position: 'absolute', right: 0, top: -16, fontSize: 11, color: colors.textMuted },
  btnRow: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 6,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgInput,
  },
  actionBtnText: { fontSize: 13, color: colors.gold, fontWeight: '600' },
  deleteBtn: { borderColor: colors.border },
  downloadingText: { fontSize: 13, color: colors.textMuted, alignSelf: 'center' },
});
