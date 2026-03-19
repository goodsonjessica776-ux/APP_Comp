"use client";

import React, { useRef, useState } from 'react';
import { Eye, TrendingUp, CalendarDays } from 'lucide-react';

interface AdItem {
  id: string;
  title: string;
  impressions: string | number;
  videoName: string;
  date: string;
}

export default function AdCard({ ad, rank, onClick }: { ad: AdItem; rank: number; onClick?: (ad: AdItem) => void }) {
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

  return (
    <div 
      className="glass-card rounded-[32px] overflow-hidden flex flex-col group relative cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onClick && onClick(ad)}
    >
      {/* Absolute Ranking Badge */}
      <div className={`absolute top-4 left-4 z-20 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl
        ${rank <= 3 ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white' : 'bg-white/10 text-slate-300'}`}>
        {rank <= 3 ? `Top ${rank}` : `No. ${rank}`}
      </div>

      {/* Video Container */}
      <div className="aspect-[9/16] bg-black relative overflow-hidden">
        <video 
          ref={videoRef}
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        >
          <source src={`/videos/${ad.videoName}`} type="video/mp4" />
        </video>
        
        {/* Play Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
            <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
              <Eye className="w-5 h-5 text-white/70" />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow space-y-4">
        <h3 className="text-sm font-semibold leading-relaxed line-clamp-2 h-10 group-hover:text-indigo-400 transition-colors">
          {ad.title}
        </h3>
        
        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-tight flex items-center gap-1">
              <TrendingUp size={12} /> 预估曝光
            </span>
            <p className="text-sm font-bold text-emerald-400">
              {formatDisplay(ad.impressions)}
            </p>
          </div>
          <div className="space-y-1 text-right">
            <span className="text-[10px] text-slate-500 uppercase tracking-tight flex items-center gap-1 justify-end">
              <CalendarDays size={12} /> 更新于
            </span>
            <p className="text-[11px] font-medium text-slate-300">
              {ad.date}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
