export const colors = {
  bg: '#0b1629',
  bgCard: '#102040',
  bgInput: '#0d1e38',
  bgSection: '#0f2244',
  border: '#1a3260',
  borderLight: '#1e3d6e',
  gold: '#c9a84c',
  goldLight: '#e4c97a',
  goldDim: '#8a6e2a',
  text: '#dce8f5',
  textMuted: '#6a87aa',
  textDim: '#3d5570',
  success: '#27ae60',
  successBg: '#0d2e1a',
  warning: '#e67e22',
  warningBg: '#2a1a08',
  danger: '#c0392b',
  dangerBg: '#2a0d0d',
  anthropic: '#d4845a',
  anthropicBg: '#2a1508',
  local: '#5ab0e0',
  localBg: '#082230',
};

export const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#e1306c',
  twitter: '#1da1f2',
  youtube: '#ff0000',
  tiktok: '#69c9d0',
  facebook: '#1877f2',
};

export const PLATFORM_ICONS: Record<string, string> = {
  instagram: '📸',
  twitter: '𝕏',
  youtube: '▶',
  tiktok: '♪',
  facebook: 'f',
};

export const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  twitter: 'X / Twitter',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  facebook: 'Facebook',
};

export function scoreColor(score: number): string {
  if (score >= 75) return '#27ae60';
  if (score >= 50) return '#e67e22';
  return '#c0392b';
}

export function scoreBg(score: number): string {
  if (score >= 75) return '#0d2e1a';
  if (score >= 50) return '#2a1a08';
  return '#2a0d0d';
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export const s = {
  card: {
    backgroundColor: '#102040' as const,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1a3260' as const,
    padding: 14,
    marginBottom: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#6a87aa' as const,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#0d1e38' as const,
    borderWidth: 1,
    borderColor: '#1a3260' as const,
    borderRadius: 8,
    color: '#dce8f5' as const,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#c9a84c' as const,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
    marginBottom: 10,
  },
  btn: {
    borderRadius: 8,
    paddingVertical: 13,
    paddingHorizontal: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
};
