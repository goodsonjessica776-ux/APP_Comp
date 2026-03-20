"use client";

import React, { useRef, useState } from 'react';
import { Eye, TrendingUp, CalendarDays } from 'lucide-react';

interface AdItem {
  id: string;
  title: string;
  impressions: string | number;
  videoName: string;
  date: string;
  category?: string;
  tags?: string[];
  delivery_days?: number;
  activity_index?: number;
  today_exposure?: number;
  channels?: any[];
}

export default function AdCard({ 
  ad, 
  rank, 
  onClick, 
  layout = 'grid' 
}: { 
  ad: AdItem; 
  rank: number; 
  onClick?: (ad: AdItem) => void;
  layout?: 'grid' | 'list';
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const formatDisplay = (val: string | number) => {
    if (typeof val === 'string') return val;
    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
    if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
    return val.toLocaleString();
  };

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  if (layout === 'list') {
    return (
      <div 
        className="group relative flex flex-row items-center overflow-hidden rounded-[24px] border border-white/10 bg-slate-900/50 backdrop-blur-xl transition-all duration-300 hover:bg-white/5 hover:border-indigo-500/30 cursor-pointer"
        onClick={() => onClick && onClick(ad)}
      >
        {/* Simplified Rank for List */}
        <div className="w-12 flex justify-center shrink-0">
          <span className={`text-[10px] font-black ${rank <= 3 ? 'text-indigo-400' : 'text-slate-600'}`}>
            #{rank}
          </span>
        </div>

        {/* Small Video Thumbnail */}
        <div className="relative w-32 h-48 sm:w-40 sm:h-60 overflow-hidden bg-black shrink-0 border-r border-white/5"
             onMouseEnter={handleMouseEnter}
             onMouseLeave={handleMouseLeave}>
          <video 
            ref={videoRef}
            loop 
            muted 
            playsInline
            className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          >
            <source src={`/videos/${ad.videoName}`} type="video/mp4" />
          </video>
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Eye className="h-4 w-4 text-white/40" />
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col sm:flex-row p-6 gap-6 items-center">
          <div className="flex-1 space-y-3 min-w-0 w-full">
            <h3 className="line-clamp-2 text-sm font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">
              {ad.title}
            </h3>
            <div className="flex flex-wrap gap-2">
              {ad.tags?.slice(0, 3).map(tag => (
                <span key={tag} className="rounded-md bg-indigo-500/5 px-2 py-0.5 text-[9px] font-bold text-indigo-400/70 border border-indigo-500/10">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Metrics Column */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-8 shrink-0 w-full sm:w-auto">
            <div className="flex flex-col items-center sm:items-end">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">活跃指数</span>
              <span className="text-sm font-black text-indigo-400">{ad.activity_index || '0.0'}</span>
            </div>
            <div className="flex flex-col items-center sm:items-end">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">今日曝光</span>
              <span className="text-sm font-black text-amber-500/80">{formatDisplay(ad.today_exposure || 0)}</span>
            </div>
            <div className="flex flex-col items-center sm:items-end sm:min-w-[80px]">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">投放天数</span>
              <span className="text-sm font-bold text-slate-300">{ad.delivery_days || 0}</span>
            </div>
            <div className="flex flex-col items-center sm:items-end sm:min-w-[80px]">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">历史总计</span>
              <span className="text-sm font-bold text-emerald-500/80">{formatDisplay(ad.impressions)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="group relative flex flex-col overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/50 backdrop-blur-xl transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:border-indigo-500/30"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onClick && onClick(ad)}
    >
      {/* Ranking Badge */}
      <div className={`absolute left-4 top-4 z-20 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl backdrop-blur-md border border-white/10
        ${rank <= 3 ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white' : 'bg-black/60 text-slate-400'}`}>
        {rank <= 3 ? `🔥 Top ${rank}` : `No. ${rank}`}
      </div>

      {/* Video Container */}
      <div className="relative aspect-[9/16] overflow-hidden bg-black">
        <video 
          ref={videoRef}
          loop 
          muted 
          playsInline
          className="h-full w-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:brightness-110"
        >
          <source src={`/videos/${ad.videoName}`} type="video/mp4" />
        </video>
        
        {/* Play Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity duration-500 group-hover:opacity-0">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur-md">
              <Eye className="h-6 w-6 text-white/80" />
            </div>
          </div>
        )}
        
        {/* Stats Overlay on Top */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 pt-12 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
             <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <TrendingUp size={12} className="text-indigo-400" /> 活跃指数
                    </span>
                    <span className="text-lg font-black text-white drop-shadow-md">{ad.activity_index || '0.0'}</span>
                </div>
                <div className="flex flex-col text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1 justify-end">
                        今日曝光 <Eye size={12} className="text-amber-400" />
                    </span>
                    <span className="text-sm font-black text-amber-400 drop-shadow-md">{formatDisplay(ad.today_exposure || 0)}</span>
                </div>
             </div>
        </div>
      </div>

      {/* Content Footer */}
      <div className="flex flex-grow flex-col space-y-4 p-6 bg-gradient-to-b from-transparent to-black/20">
        <h3 className="line-clamp-2 text-sm font-bold leading-relaxed text-slate-200 transition-colors group-hover:text-white">
          {ad.title}
        </h3>

        {/* Tags Row */}
        {ad.tags && ad.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {ad.tags.slice(0, 3).map(tag => (
              <span key={tag} className="rounded-lg bg-indigo-500/10 px-2.5 py-1 text-[9px] font-bold text-indigo-300 border border-indigo-500/20 uppercase tracking-tighter">
                {tag}
              </span>
            ))}
            {ad.tags.length > 3 && (
              <span className="rounded-lg bg-white/5 px-2.5 py-1 text-[9px] font-bold text-slate-500 border border-white/5">
                +{ad.tags.length - 3}
              </span>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">投放时长</span>
            <span className="text-xs font-bold text-slate-300">{ad.delivery_days || 0} Days</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">历史总计</span>
            <span className="text-xs font-bold text-emerald-400">{formatDisplay(ad.impressions)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
