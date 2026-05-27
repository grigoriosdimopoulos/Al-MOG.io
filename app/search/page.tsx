'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SearchForm } from '@/components/SearchForm';
import { ResultsGrid } from '@/components/ResultsGrid';
import { LoadingAnalysis } from '@/components/LoadingAnalysis';
import { SearchParams, SearchResult, UserTier } from '@/types/influencer';

export default function SearchPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tier] = useState<UserTier>('free');

  async function handleSearch(params: SearchParams) {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await res.json() as SearchResult & { error?: string; code?: string };

      if (!res.ok) {
        if (data.code === 'RATE_LIMIT') {
          setError('You\'ve reached your 3 free searches for today. Upgrade to PRO for unlimited searches.');
        } else {
          setError(data.error || 'Search failed. Please try again.');
        }
        return;
      }

      setResult(data);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-3 flex items-center gap-4 sticky top-0 z-40 bg-[#0a1628]/95 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="text-xl">🗳️</span>
          <span className="font-black text-lg text-white tracking-tight">
            Al-MOG<span style={{ color: '#c9a84c' }}>.io</span>
          </span>
        </Link>
        <div className="hidden sm:flex items-center gap-1 text-slate-500">
          <span>/</span>
          <span className="text-sm text-slate-400">Influencer Search</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-700 text-slate-300">FREE</div>
          <button className="px-3 py-1.5 text-xs font-bold rounded-lg text-black" style={{ background: 'linear-gradient(to right, #f59e0b, #d97706)' }}>
            Upgrade PRO
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 xl:w-80 flex-shrink-0 border-r border-slate-800 bg-[#0f1b2d] overflow-y-auto p-5">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-white mb-1">Search Parameters</h2>
            <p className="text-xs text-slate-500">Configure your search and let the AI agent find the best influencers for your campaign.</p>
          </div>
          <SearchForm onSearch={handleSearch} isLoading={isLoading} />
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">
              {error}
            </div>
          )}

          {isLoading && <LoadingAnalysis />}

          {!isLoading && !result && !error && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-white mb-2">Ready to Find Influencers</h3>
              <p className="text-sm text-slate-400 max-w-xs">
                Set your campaign keywords, choose platforms, and click{' '}
                <span style={{ color: '#c9a84c' }}>Find Influencers</span> to start the AI analysis.
              </p>
              <div className="mt-6 p-4 bg-slate-800/40 rounded-xl border border-slate-700/40 text-xs text-slate-500 max-w-sm">
                💡 <strong className="text-slate-400">Tip:</strong> Add keywords like your campaign issues (e.g. &quot;healthcare&quot;, &quot;climate&quot;), select platforms, and add political topics for the most targeted results.
              </div>
            </div>
          )}

          {!isLoading && result && (
            <ResultsGrid result={result} tier={tier} />
          )}
        </main>
      </div>
    </div>
  );
}
