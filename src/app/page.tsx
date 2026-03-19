"use client";

import React, { useState, useMemo } from 'react';
import adsData from '@/data/ads.json';
import AdCard from '@/components/AdCard';
import { Search, SortDesc, SortAsc, Calendar, Sparkles } from 'lucide-react';

interface AdItem {
  id: string;
  title: string;
  impressions: string | number;
  videoName: string;
  date: string;
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc' | 'date'>('desc');
  const [selectedAd, setSelectedAd] = useState<AdItem | null>(null);

  const filteredAndSortedAds = useMemo(() => {
    const parseImpressions = (val: string | number) => {
      if (typeof val === 'number') return val;
      const clean = val.toLowerCase().replace(/,/g, '');
      if (clean.endsWith('m')) return parseFloat(clean) * 1000000;
      if (clean.endsWith('k')) return parseFloat(clean) * 1000;
      return parseFloat(clean) || 0;
    };

    let result = [...adsData];

    if (searchTerm) {
      result = result.filter(ad => 
        ad.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    result.sort((a, b) => {
      if (sortOrder === 'desc') return parseImpressions(b.impressions) - parseImpressions(a.impressions);
      if (sortOrder === 'asc') return parseImpressions(a.impressions) - parseImpressions(b.impressions);
      if (sortOrder === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
      return 0;
    });

    return result;
  }, [searchTerm, sortOrder]);

  return (
    <main className="min-h-screen p-4 md:p-8 lg:p-12 space-y-12 max-w-[1600px] mx-auto">
      {/* Header Area */}
      <header className="glass p-6 md:p-8 rounded-[32px] sticky top-6 z-50 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.5)]">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AdVision <span className="text-slate-400 font-normal">Dashboard</span></h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest">Team Internal Access</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* Search */}
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
        </div>
      </header>

      {/* Grid Area */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-slate-400 text-sm font-medium">发现 ({filteredAndSortedAds.length} 条爆款素材)</h2>
        </div>

        {filteredAndSortedAds.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8">
            {filteredAndSortedAds.map((ad, idx) => (
              <AdCard key={ad.id} ad={ad} rank={adsData.indexOf(ad) + 1} onClick={setSelectedAd} />
            ))}
          </div>
        ) : (
          <div className="glass rounded-[40px] border-dashed border-2 py-32 flex flex-col items-center gap-4">
            <p className="text-slate-500">未找到相关素材</p>
            <button onClick={() => setSearchTerm('')} className="text-indigo-400 text-sm hover:underline">清空搜索条件</button>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="py-12 text-center text-slate-600 text-xs border-t border-white/5">
        &copy; 2026 AdVision Studio. For Internal Team Use Only.
      </footer>

      {/* Video Modal for Sound Playback */}
      {selectedAd && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setSelectedAd(null)}
        >
          <div 
            className="relative w-full max-w-[400px] aspect-[9/16] bg-black rounded-[32px] overflow-hidden shadow-2xl border border-white/10"
            onClick={e => e.stopPropagation()}
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
            {/* Ad Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent pointer-events-none">
              <h3 className="text-white font-medium text-sm line-clamp-3 mb-2">{selectedAd.title}</h3>
              <p className="text-emerald-400 text-xs font-bold">{selectedAd.impressions.toLocaleString()} 曝光</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
