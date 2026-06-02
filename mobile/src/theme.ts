export const colors = {
  navy:       '#0d1f3c',
  navyMid:    '#162847',
  navyLite:   '#1e3560',
  navyCard:   '#0f2040',
  gold:       '#c9a84c',
  goldDark:   '#b8922a',
  white:      '#ffffff',
  offWhite:   '#f0ece4',
  slate400:   '#94a3b8',
  slate500:   '#64748b',
  slate600:   '#475569',
  slate700:   '#334155',
  slate800:   '#1e293b',
  emerald:    '#34d399',
  yellow:     '#fbbf24',
  orange:     '#fb923c',
  red:        '#ef4444',
  sky:        '#38bdf8',
  purple:     '#a855f7',
  pink:       '#ec4899',
};

export const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#e1306c',
  twitter:   '#1da1f2',
  youtube:   '#ff0000',
  tiktok:    '#69c9d0',
  facebook:  '#1877f2',
};

export const PLATFORM_ICONS: Record<string, string> = {
  instagram: '📸',
  twitter:   '🐦',
  youtube:   '▶',
  tiktok:    '♪',
  facebook:  '👥',
};

export function scoreColor(score: number): string {
  if (score >= 80) return colors.emerald;
  if (score >= 60) return colors.yellow;
  return colors.orange;
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}
