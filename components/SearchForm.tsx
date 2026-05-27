'use client';

import { useState } from 'react';
import { SearchParams, Platform } from '@/types/influencer';

const PLATFORMS: { id: Platform; label: string; icon: string }[] = [
  { id: 'instagram', label: 'Instagram', icon: '📸' },
  { id: 'twitter', label: 'X / Twitter', icon: '🐦' },
  { id: 'youtube', label: 'YouTube', icon: '▶️' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵' },
  { id: 'facebook', label: 'Facebook', icon: '👥' },
];

const TOPIC_OPTIONS = [
  'healthcare', 'economy', 'immigration', 'climate change', 'education',
  'taxes', 'foreign policy', 'gun control', 'social justice', 'infrastructure',
  'housing', 'criminal justice', 'energy policy', 'veterans affairs', 'labor rights',
];

interface Props {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
}

export function SearchForm({ onSearch, isLoading }: Props) {
  const [keyword, setKeyword] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [platforms, setPlatforms] = useState<Platform[]>(['twitter', 'instagram', 'youtube']);
  const [followerMin, setFollowerMin] = useState(10000);
  const [followerMax, setFollowerMax] = useState(1000000);
  const [engagementMin, setEngagementMin] = useState(1);
  const [language, setLanguage] = useState('English');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  function addKeyword() {
    const trimmed = keyword.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords((prev) => [...prev, trimmed]);
    }
    setKeyword('');
  }

  function removeKeyword(kw: string) {
    setKeywords((prev) => prev.filter((k) => k !== kw));
  }

  function togglePlatform(p: Platform) {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

  function toggleTopic(t: string) {
    setSelectedTopics((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch({
      keywords,
      location,
      platforms,
      followerMin,
      followerMax,
      engagementMin,
      language,
      politicalTopics: selectedTopics,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Keywords */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
          Campaign Keywords
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addKeyword(); } }}
            placeholder="e.g. healthcare reform"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-gold/50"
          />
          <button
            type="button"
            onClick={addKeyword}
            className="px-3 py-2 bg-gold/10 border border-gold/30 rounded-lg text-gold text-sm hover:bg-gold/20 transition-colors"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {keywords.map((kw) => (
            <span key={kw} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gold/10 border border-gold/20 rounded-full text-xs text-gold">
              {kw}
              <button type="button" onClick={() => removeKeyword(kw)} className="hover:text-white">✕</button>
            </span>
          ))}
        </div>
        {keywords.length === 0 && (
          <p className="text-xs text-slate-500 mt-1">Press Enter or click Add after typing a keyword</p>
        )}
      </div>

      {/* Location */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
          Target Location
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. New York, NY or leave blank for national"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-gold/50"
        />
      </div>

      {/* Platforms */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
          Platforms
        </label>
        <div className="space-y-2">
          {PLATFORMS.map((p) => (
            <label key={p.id} className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => togglePlatform(p.id)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
                  platforms.includes(p.id) ? 'bg-gold border-gold' : 'border-slate-600 hover:border-slate-400'
                }`}
              >
                {platforms.includes(p.id) && <span className="text-black text-xs font-bold">✓</span>}
              </div>
              <span className="text-sm text-slate-300 group-hover:text-white transition-colors flex items-center gap-2">
                {p.icon} {p.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Follower range */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
          Follower Range
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-xs text-slate-500 mb-1">Min</div>
            <input
              type="number"
              value={followerMin}
              onChange={(e) => setFollowerMin(Number(e.target.value))}
              min={0}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold/50"
            />
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">Max</div>
            <input
              type="number"
              value={followerMax}
              onChange={(e) => setFollowerMax(Number(e.target.value))}
              min={0}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold/50"
            />
          </div>
        </div>
      </div>

      {/* Engagement */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
          Min Engagement Rate: <span className="text-gold">{engagementMin}%</span>
        </label>
        <input
          type="range"
          min={0}
          max={15}
          step={0.5}
          value={engagementMin}
          onChange={(e) => setEngagementMin(Number(e.target.value))}
          className="w-full accent-yellow-400"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>0%</span><span>15%+</span>
        </div>
      </div>

      {/* Language */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
          Language
        </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold/50"
        >
          <option>English</option>
          <option>Spanish</option>
          <option>French</option>
          <option>German</option>
          <option>Portuguese</option>
          <option>Arabic</option>
        </select>
      </div>

      {/* Political Topics */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
          Political Topics
        </label>
        <div className="flex flex-wrap gap-1.5">
          {TOPIC_OPTIONS.map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => toggleTopic(topic)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors capitalize ${
                selectedTopics.includes(topic)
                  ? 'bg-gold/10 border-gold/40 text-gold'
                  : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading || keywords.length === 0}
        className="w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-yellow-500 to-amber-400 text-black hover:from-yellow-400 hover:to-amber-300 shadow-lg shadow-yellow-500/20"
      >
        {isLoading ? 'AI Agent Running…' : '🔍 Find Influencers'}
      </button>
    </form>
  );
}
