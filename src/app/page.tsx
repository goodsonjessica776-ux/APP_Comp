"use client";

import React, { useState, useMemo } from 'react';
import adsData from '@/data/ads.json';
import AdCard from '@/components/AdCard';
import { Search, SortDesc, Calendar, Sparkles, Tag, Package, BarChart3, X, LayoutGrid, List, TrendingUp, CalendarDays } from 'lucide-react';

interface AdItem {
  id: string;
  title: string;
  impressions: string | number;
  videoName: string;
  date: string;
  category?: string;
  tags?: string[];
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc' | 'date'>('desc');
  const [selectedAd, setSelectedAd] = useState<AdItem | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showChart, setShowChart] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Extract all unique tags and categories
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    (adsData as AdItem[]).forEach(ad => ad.tags?.forEach(t => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, []);

  const allCategories = useMemo(() => {
    const catSet = new Set<string>();
    (adsData as AdItem[]).forEach(ad => { if (ad.category) catSet.add(ad.category); });
    return Array.from(catSet).sort();
  }, []);

  const parseImpressions = (val: string | number) => {
    if (typeof val === 'number') return val;
    const clean = val.toLowerCase().replace(/,/g, '');
    if (clean.endsWith('m')) return parseFloat(clean) * 1000000;
    if (clean.endsWith('k')) return parseFloat(clean) * 1000;
    return parseFloat(clean) || 0;
  };

  const formatDisplay = (val: string | number) => {
    if (typeof val === 'string') return val;
    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
    if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
    return val.toLocaleString();
  };

  const filteredAndSortedAds = useMemo(() => {
    let result = [...(adsData as AdItem[])];

    if (searchTerm) {
      result = result.filter(ad =>
        ad.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      result = result.filter(ad => ad.category === selectedCategory);
    }

    if (selectedTags.length > 0) {
      result = result.filter(ad =>
        selectedTags.every(tag => ad.tags?.includes(tag))
      );
    }

    result.sort((a, b) => {
      if (sortOrder === 'desc') return parseImpressions(b.impressions) - parseImpressions(a.impressions);
      if (sortOrder === 'asc') return parseImpressions(a.impressions) - parseImpressions(b.impressions);
      if (sortOrder === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
      return 0;
    });

    return result;
  }, [searchTerm, sortOrder, selectedTags, selectedCategory]);

  // Tag distribution for the current filtered data
  const tagDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredAndSortedAds.forEach(ad => {
      ad.tags?.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1]);
  }, [filteredAndSortedAds]);

  const maxTagCount = tagDistribution.length > 0 ? tagDistribution[0][1] : 1;

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearAllFilters = () => {
    setSelectedTags([]);
    setSelectedCategory('');
    setSearchTerm('');
  };

  const hasActiveFilters = selectedTags.length > 0 || selectedCategory !== '' || searchTerm !== '';

  return (
    <main className="min-h-screen p-4 md:p-8 lg:p-12 space-y-8 max-w-[1600px] mx-auto">
      {/* Header Area */}
      <header className="glass p-6 md:p-8 rounded-[32px] sticky top-6 z-50 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.5)]">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AdVision <span className="text-slate-400 font-normal">Dashboard</span></h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest">Team Internal Access · V2.0</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text" 
              placeholder="搜索素材标题..." 
              className="bg-black/40 border border-white/10 rounded-2xl py-3 pl-11 pr-4 w-full sm:w-64 outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm"
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Sort */}
          <div className="flex bg-black/40 border border-white/10 rounded-2xl p-1">
            <button 
              onClick={() => setSortOrder('desc')}
              className={`px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-2 ${sortOrder === 'desc' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              <SortDesc size={16} /> <span className="hidden sm:inline">高曝</span>
            </button>
            <button 
              onClick={() => setSortOrder('date')}
              className={`px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-2 ${sortOrder === 'date' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              <Calendar size={16} /> <span className="hidden sm:inline">最新</span>
            </button>
          </div>

          {/* View Toggle - Grid / Table */}
          <div className="flex bg-black/40 border border-white/10 rounded-2xl p-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-xl text-sm transition-all flex items-center gap-1.5 ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              title="视频模式"
            >
              <LayoutGrid size={16} />
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 rounded-xl text-sm transition-all flex items-center gap-1.5 ${viewMode === 'table' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              title="文案模式"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Filter Area */}
      <section className="glass rounded-[28px] p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Tag size={14} className="text-indigo-400" /> 筛选面板
            </h3>
            <button
              onClick={() => setShowChart(!showChart)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${showChart ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-white/10 text-slate-400 hover:text-white hover:border-white/20'}`}
            >
              <BarChart3 size={12} /> 数据分布
            </button>
          </div>
          {hasActiveFilters && (
            <button onClick={clearAllFilters} className="text-xs text-slate-500 hover:text-indigo-400 transition-colors flex items-center gap-1">
              <X size={12} /> 清空筛选
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Package size={11} /> 按产品筛选
          </span>
          <div className="flex flex-wrap gap-2">
            {allCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  selectedCategory === cat 
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]' 
                    : 'border-white/8 text-slate-400 hover:text-white hover:border-white/20 bg-white/[0.02]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Tag Filter */}
        <div className="space-y-2">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Tag size={11} /> 按标签筛选
          </span>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  selectedTags.includes(tag) 
                    ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.2)]' 
                    : 'border-white/8 text-slate-400 hover:text-white hover:border-white/20 bg-white/[0.02]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Tag Distribution Chart */}
        {showChart && tagDistribution.length > 0 && (
          <div className="pt-4 border-t border-white/5 space-y-3">
            <h4 className="text-xs text-slate-400 font-medium">
              标签分布 · 当前 {filteredAndSortedAds.length} 条素材
            </h4>
            <div className="space-y-2">
              {tagDistribution.map(([tag, count]) => (
                <div key={tag} className="flex items-center gap-3 group/bar">
                  <span className="text-[11px] text-slate-400 w-20 text-right shrink-0 group-hover/bar:text-white transition-colors">{tag}</span>
                  <div className="flex-1 h-7 bg-white/[0.03] rounded-lg overflow-hidden relative">
                    <div
                      className="h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-2"
                      style={{
                        width: `${Math.max((count / maxTagCount) * 100, 8)}%`,
                        background: selectedTags.includes(tag) 
                          ? 'linear-gradient(90deg, rgba(99,102,241,0.4), rgba(99,102,241,0.6))'
                          : 'linear-gradient(90deg, rgba(255,255,255,0.05), rgba(255,255,255,0.1))'
                      }}
                    >
                      <span className="text-[10px] font-bold text-white/70">{count}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleTag(tag)}
                    className={`text-[10px] px-2 py-0.5 rounded-full border transition-all shrink-0 ${
                      selectedTags.includes(tag) ? 'border-indigo-500/40 text-indigo-300 bg-indigo-500/10' : 'border-white/10 text-slate-500 hover:text-white'
                    }`}
                  >
                    {selectedTags.includes(tag) ? '已选' : '筛选'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Content Area */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-slate-400 text-sm font-medium">
            {viewMode === 'grid' ? '🎬 视频模式' : '📝 文案模式'} · 发现 ({filteredAndSortedAds.length} 条爆款素材)
          </h2>
          {hasActiveFilters && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              {selectedCategory && <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{selectedCategory}</span>}
              {selectedTags.map(t => <span key={t} className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{t}</span>)}
            </div>
          )}
        </div>

        {filteredAndSortedAds.length > 0 ? (
          viewMode === 'grid' ? (
            /* === VIDEO GRID VIEW === */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8">
              {filteredAndSortedAds.map((ad, idx) => (
                <AdCard key={ad.id} ad={ad} rank={idx + 1} onClick={setSelectedAd} />
              ))}
            </div>
          ) : (
            /* === TABLE / TEXT VIEW === */
            <div className="glass rounded-[24px] overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-[auto_1fr_120px_200px_120px] gap-4 px-6 py-4 border-b border-white/5 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                <span className="w-12 text-center">#</span>
                <span>广告文案</span>
                <span className="text-center">预估曝光</span>
                <span className="text-center">标签</span>
                <span className="text-center">更新时间</span>
              </div>
              {/* Table Rows */}
              {filteredAndSortedAds.map((ad, idx) => (
                <div
                  key={ad.id}
                  onClick={() => setSelectedAd(ad)}
                  className="grid grid-cols-[auto_1fr_120px_200px_120px] gap-4 px-6 py-4 border-b border-white/[0.03] items-center hover:bg-white/[0.03] cursor-pointer transition-colors group"
                >
                  {/* Rank */}
                  <div className="w-12 flex justify-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                      idx < 3 ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white' : 'bg-white/5 text-slate-500'
                    }`}>
                      {idx + 1}
                    </span>
                  </div>
                  {/* Title */}
                  <div className="min-w-0">
                    <p className="text-sm text-slate-200 group-hover:text-indigo-400 transition-colors truncate font-medium">
                      {ad.title}
                    </p>
                    {ad.category && (
                      <span className="text-[10px] text-slate-500 mt-0.5 inline-block">{ad.category}</span>
                    )}
                  </div>
                  {/* Impressions */}
                  <div className="text-center">
                    <span className="text-sm font-bold text-emerald-400">{formatDisplay(ad.impressions)}</span>
                  </div>
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 justify-center">
                    {ad.tags?.map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-[10px] text-indigo-300 border border-indigo-500/15 font-medium whitespace-nowrap">
                        {tag}
                      </span>
                    ))}
                  </div>
                  {/* Date */}
                  <div className="text-center">
                    <span className="text-[11px] text-slate-400">{ad.date}</span>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="glass rounded-[40px] border-dashed border-2 py-32 flex flex-col items-center gap-4">
            <p className="text-slate-500">未找到相关素材</p>
            <button onClick={clearAllFilters} className="text-indigo-400 text-sm hover:underline">清空所有筛选条件</button>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="py-12 text-center text-slate-600 text-xs border-t border-white/5">
        &copy; 2026 AdVision Studio. For Internal Team Use Only.
      </footer>

      {/* Video Modal */}
      {selectedAd && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setSelectedAd(null)}
        >
          <div 
            className="relative w-full max-w-[400px] aspect-[9/16] bg-black rounded-[32px] overflow-hidden shadow-2xl border border-white/10"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedAd(null)} 
              className="absolute top-4 right-4 z-50 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 transition-all border border-white/10"
            >
              ✕
            </button>
            <video 
              src={`/videos/${selectedAd.videoName}`} 
              controls 
              autoPlay 
              className="w-full h-full object-contain"
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent pointer-events-none">
              <h3 className="text-white font-medium text-sm line-clamp-3 mb-2">{selectedAd.title}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                {selectedAd.category && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] border border-emerald-500/20">{selectedAd.category}</span>
                )}
                <span className="text-emerald-400 text-xs font-bold">{formatDisplay(selectedAd.impressions)} 曝光</span>
              </div>
              {selectedAd.tags && selectedAd.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedAd.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded-full bg-white/10 text-white/70 text-[10px]">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
