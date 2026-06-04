export const colors = {
  // Core backgrounds — deep Hellenic navy
  bg: '#050f1c',
  bgCard: '#091929',
  bgInput: '#06111f',
  bgSection: '#0b1e30',
  bgHighlight: '#0f2540',

  // Borders
  border: '#152d4a',
  borderActive: '#1e5080',
  borderFocus: '#2e7ab5',

  // Greek gov blue scale
  blue: '#2e7ab5',
  blueLight: '#4a9fd4',
  blueDim: '#1a4d78',
  blueDeep: '#0e2e4f',

  // Gold — reserved for primary CTA only
  gold: '#c0973e',
  goldLight: '#d4ae5a',
  goldDim: '#7a5f20',

  // Text
  text: '#e8f0f8',
  textSub: '#9ab8d4',
  textMuted: '#5d849e',
  textDim: '#2d4d68',

  // Semantic
  success: '#27ae60',
  successBg: '#071f10',
  warning: '#d68910',
  warningBg: '#1f1505',
  danger: '#c0392b',
  dangerBg: '#200a09',

  // AI mode
  anthropic: '#c0674a',
  anthropicBg: '#1f0e09',
  local: '#4a9fd4',
  localBg: '#071829',
};

export const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#d63384',
  twitter: '#1da1f2',
  youtube: '#dc3545',
  tiktok: '#6edcd9',
  facebook: '#1877f2',
};

export const PLATFORM_ICONS: Record<string, string> = {
  instagram: 'IG',
  twitter: '𝕏',
  youtube: 'YT',
  tiktok: 'TK',
  facebook: 'FB',
};

export const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  twitter: 'X / Twitter',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  facebook: 'Facebook',
};

export const LANGUAGE_LABELS: Record<string, string> = {
  el: 'Ελληνικά',
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  it: 'Italiano',
  es: 'Español',
  tr: 'Türkçe',
  ar: 'العربية',
};

export function scoreColor(score: number): string {
  if (score >= 75) return '#27ae60';
  if (score >= 50) return '#d68910';
  return '#c0392b';
}

export function scoreBg(score: number): string {
  if (score >= 75) return '#071f10';
  if (score >= 50) return '#1f1505';
  return '#200a09';
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

// Reusable style primitives — gov-style: tight radius, structured
export const s = {
  card: {
    backgroundColor: '#091929' as const,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#152d4a' as const,
    padding: 14,
    marginBottom: 8,
  },
  section: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#152d4a' as const,
    backgroundColor: '#091929' as const,
    padding: 14,
    marginBottom: 12,
  },
  label: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#5d849e' as const,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#4a9fd4' as const,
    letterSpacing: 1.4,
    textTransform: 'uppercase' as const,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#06111f' as const,
    borderWidth: 1,
    borderColor: '#152d4a' as const,
    borderRadius: 3,
    color: '#e8f0f8' as const,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  btn: {
    borderRadius: 3,
    paddingVertical: 11,
    paddingHorizontal: 18,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
};
