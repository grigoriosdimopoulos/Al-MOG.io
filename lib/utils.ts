import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function platformColor(platform: string): string {
  const colors: Record<string, string> = {
    instagram: 'from-purple-500 to-pink-500',
    twitter: 'from-sky-400 to-sky-500',
    youtube: 'from-red-500 to-red-600',
    tiktok: 'from-black to-zinc-800',
    facebook: 'from-blue-600 to-blue-700',
  };
  return colors[platform] || 'from-gray-500 to-gray-600';
}

export function platformBg(platform: string): string {
  const colors: Record<string, string> = {
    instagram: 'bg-gradient-to-br from-purple-500 to-pink-500',
    twitter: 'bg-sky-500',
    youtube: 'bg-red-600',
    tiktok: 'bg-black',
    facebook: 'bg-blue-600',
  };
  return colors[platform] || 'bg-gray-500';
}

export function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-yellow-400';
  return 'text-orange-400';
}

export function scoreRingColor(score: number): string {
  if (score >= 80) return '#34d399';
  if (score >= 60) return '#fbbf24';
  return '#fb923c';
}
