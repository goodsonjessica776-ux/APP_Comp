"use client";

import React, { useState, useMemo, useEffect } from 'react';
import adsDataRaw from '@/data/ads.json';
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

// Safely handle adsData import
const adsData: AdItem[] = Array.isArray(adsDataRaw) ? adsDataRaw : (adsDataRaw as any)?.default || [];

export default function Home() {
  const [hasMounted, setHasMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc' | 'date'>('desc');
  const [selectedAd, setSelectedAd] = useState<AdItem | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showChart, setShowChart] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Prevent hydration mismatch by only rendering full interactive UI after mount
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Extract all unique tags and categories safely
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    adsData.forEach(ad => {
      if (Array.isArray(ad.tags)) {
        ad.tags.forEach(t => tagSet.add(t));
      }
    });
    return Array.from(tagSet).sort();
  }, []);

  const allCategories = useMemo(() => {
    const catSet = new Set<string>();
    adsData.forEach(ad => {
      if (ad.category) catSet.add(ad.category);
    });
    return Array.from(catSet).sort();
  }, []);

  const parseImpressions = (val: string | number) => {
    if (typeof val === 'number') return val;
    if (!val || typeof val !== 'string') return 0;
    const clean = val.toLowerCase().replace(/,/g, '');
    if (clean.endsWith('m')) return parseFloat(clean) * 1000000;
    if (clean.endsWith('k')) return parseFloat(clean) * 1000;
    return parseFloat(clean) || 0;
  };

  const formatDisplay = (val: string | number) => {
    if (typeof val === 'string') return val;
    if (typeof val !== 'number') return '0';
    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
    if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
    return val.toLocaleString();
  };

  const filteredAndSortedAds = useMemo(() => {
    let result = [...adsData];

    if (searchTerm) {
      result = result.filter(ad =>
        ad.title?.toLowerCase().includes(searchTerm.toLowerCase())
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
      if (sortOrder === 'date') {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      }
      return 0;
    });

    return result;
  }, [searchTerm, sortOrder, selectedTags, selectedCategory]);

  const tagDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredAndSortedAds.forEach(ad => {
      ad.tags?.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [filteredAndSortedAds]);

  const maxTagCount = tagDistribution.length > 0 ? tagDistribution[0][1] : 1;

  if (!hasMounted) {
    // Return primitive layout to match Server Side Render shell
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-slate-500 text-sm animate-pulse">正在加载素材库...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8 lg:p-12 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      <header className="glass p-6 md:p-8 rounded-[32px] sticky top-6 z-50 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl transition-all">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.5)]">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AdVision <span className="text-slate-400 font-normal">Dashboard</span></h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest">Team Internal Access · V2.1</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text" 
              placeholder="搜索素材标题..." 
              className="bg-black/40 border border-white/10 rounded-2xl py-3 pl-11 pr-4 w-full sm:w-64 outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex bg-black/40 border border-white/10 rounded-2xl p-1">
            <button onClick={() => setSortOrder('desc')} className={`px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-2 ${sortOrder === 'desc' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
              <SortDesc size={16} /> <span className="hidden sm:inline">高曝</span>
            </button>
            <button onClick={() => setSortOrder('date')} className={`px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-2 ${sortOrder === 'date' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
              <Calendar size={16} /> <span className="hidden sm:inline">最新</span>
            </button>
          </div>

          <div className="flex bg-black/40 border border-white/10 rounded-2xl p-1">
            <button onClick={() => setViewMode('grid')} className={`px-3 py-2 rounded-xl text-sm transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}><LayoutGrid size={16} /></button>
            <button onClick={() => setViewMode('table')} className={`px-3 py-2 rounded-xl text-sm transition-all ${viewMode === 'table' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}><List size={16} /></button>
          </div>
        </div>
      </header>

      <section className="glass rounded-[28px] p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2"><Tag size={14} className="text-indigo-400" /> 筛选面板</h3>
          <button onClick={() => setShowChart(!showChart)} className={`text-xs px-3 py-1.5 rounded-full border transition-all ${showChart ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-white/10 text-slate-400 hover:text-white'}`}>数据分布</button>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">按产品筛选</span>
          <div className="flex flex-wrap gap-2">
            {allCategories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)} className={`px-4 py-1.5 rounded-full text-xs border transition-all ${selectedCategory === cat ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-lg' : 'border-white/8 text-slate-400 hover:text-white'}`}>{cat}</button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">按标签筛选</span>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <button key={tag} onClick={() => {
                setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
              }} className={`px-4 py-1.5 rounded-full text-xs border transition-all ${selectedTags.includes(tag) ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300 shadow-lg' : 'border-white/8 text-slate-400 hover:text-white'}`}>{tag}</button>
            ))}
          </div>
        </div>

        {showChart && tagDistribution.length > 0 && (
          <div className="pt-4 border-t border-white/5 space-y-3">
            {tagDistribution.map(([tag, count]) => (
              <div key={tag} className="flex items-center gap-3">
                <span className="text-[11px] text-slate-400 w-20 text-right shrink-0">{tag}</span>
                <div className="flex-1 h-6 bg-white/[0.03] rounded-lg overflow-hidden">
                  <div className="h-full bg-indigo-600/40 rounded-lg transition-all" style={{ width: `${(count / maxTagCount) * 100}%` }} />
                </div>
                <span className="text-[10px] font-bold text-white/50 w-8">{count}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        {filteredAndSortedAds.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
              {filteredAndSortedAds.map((ad, idx) => (
                <AdCard key={ad.id} ad={ad} rank={idx + 1} onClick={setSelectedAd} />
              ))}
            </div>
          ) : (
            <div className="glass rounded-[24px] overflow-hidden">
              <div className="grid grid-cols-[auto_1fr_100px_180px_100px] gap-4 px-6 py-4 border-b border-white/5 text-[10px] text-slate-500 uppercase font-semibold">
                <span className="w-8 text-center">#</span><span>文案</span><span className="text-center">曝光</span><span className="text-center">标签</span><span className="text-center">日期</span>
              </div>
              {filteredAndSortedAds.map((ad, idx) => (
                <div key={ad.id} onClick={() => setSelectedAd(ad)} className="grid grid-cols-[auto_1fr_100px_180px_100px] gap-4 px-6 py-4 border-b border-white/[0.02] items-center hover:bg-white/[0.03] cursor-pointer group transition-colors">
                  <div className="w-8 flex justify-center"><span className={`px-2 py-0.5 rounded text-[10px] ${idx < 3 ? 'bg-orange-600 text-white' : 'bg-white/5 text-slate-500'}`}>{idx + 1}</span></div>
                  <div className="truncate text-sm text-slate-200 group-hover:text-indigo-400 transition-colors font-medium">{ad.title}</div>
                  <div className="text-center text-sm font-bold text-emerald-400">{formatDisplay(parseImpressions(ad.impressions))}</div>
                  <div className="flex flex-wrap gap-1 justify-center">{ad.tags?.slice(0, 2).map(t => <span key={t} className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-[9px] text-indigo-300 border border-indigo-500/10">{t}</span>)} {ad.tags && ad.tags.length > 2 && <span className="text-[9px] text-slate-500">+{ad.tags.length-2}</span>}</div>
                  <div className="text-center text-[10px] text-slate-500">{ad.date || '-'}</div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="glass rounded-[40px] border-dashed border-2 py-24 flex flex-col items-center gap-4">
            <p className="text-slate-500">暂无筛选结果</p>
            <button onClick={clearAllFilters} className="text-indigo-400 text-sm hover:underline">重置所有筛选</button>
          </div>
        )}
      </section>

      {selectedAd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md" onClick={() => setSelectedAd(null)}>
          <div className="relative w-full max-w-[420px] aspect-[9/16] bg-black rounded-[32px] overflow-hidden border border-white/10" onClick={(e) => e.stopPropagation()}>
            <video src={`/videos/${selectedAd.videoName}`} controls autoPlay className="w-full h-full" />
            <button onClick={() => setSelectedAd(null)} className="absolute top-4 right-4 w-10 h-10 bg-black/50 rounded-full text-white flex items-center justify-center">✕</button>
          </div>
        </div>
      )}
    </main>
  );
}
