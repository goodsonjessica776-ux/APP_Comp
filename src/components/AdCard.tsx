"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Eye, TrendingUp, VideoOff } from 'lucide-react';

interface AdItem {
  id: string;
  title: string;
  impressions: string | number;
  videoName: string;
  poster?: string;
  date: string;
  category?: string;
  tags?: string[];
  delivery_days?: number | string;
  activity_index?: number;
  today_exposure?: number | string;
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const videoSrc = `/videos/${ad.videoName}`;
  const isPlaceholder = ad.videoName === 'placeholder.mp4';

  // Only show video when card is visible in viewport (lazy loading)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const formatDisplay = (val: string | number | undefined) => {
    if (val === undefined || val === null) return '0';
    if (typeof val === 'string') return val;
    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
    if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
    return val.toLocaleString();
  };

  const handleMouseEnter = useCallback(() => {
    if (videoRef.current && !hasError && !isPlaceholder) {
      videoRef.current.play().catch(() => setHasError(true));
      setIsPlaying(true);
    }
  }, [hasError, isPlaceholder]);

  const handleMouseLeave = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  const handleVideoError = () => {
    setHasError(true);
    setIsPlaying(false);
  };

  // Shared video element
  const VideoArea = ({ className = '', small = false }: { className?: string; small?: boolean }) => (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-black ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isVisible && !isPlaceholder && !hasError ? (
        <video
          ref={videoRef}
          loop
          muted
          playsInline
          preload="none"
          poster={ad.poster || undefined}
          onError={handleVideoError}
          onLoadedData={() => setIsLoaded(true)}
          className={`h-full w-full object-cover transition-all duration-700 ${small ? 'opacity-80 group-hover:opacity-100' : 'group-hover:scale-105 group-hover:brightness-110'}`}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : null}

      {/* Error / Placeholder state */}
      {(hasError || isPlaceholder) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 gap-2">
          <VideoOff className="w-6 h-6 text-slate-600" />
          {!small && <span className="text-[10px] text-slate-600">视频不可用</span>}
        </div>
      )}

      {/* Poster/placeholder when not yet playing */}
      {!isPlaying && !hasError && !isPlaceholder && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-300 group-hover:opacity-0">
          <div className={`flex items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur-md ${small ? 'h-10 w-10' : 'h-16 w-16'}`}>
            <Eye className={`text-white/70 ${small ? 'h-4 w-4' : 'h-6 w-6'}`} />
          </div>
        </div>
      )}
    </div>
  );

  if (layout === 'list') {
    return (
      <div
        className="group relative flex flex-row items-center overflow-hidden rounded-[24px] border border-white/8 bg-slate-900/40 backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.04] hover:border-indigo-500/30 cursor-pointer"
        onClick={() => onClick && onClick(ad)}
      >
        {/* Rank */}
        <div className="w-12 flex justify-center shrink-0">
          <span className={`text-[10px] font-black ${rank <= 3 ? 'text-indigo-400' : 'text-slate-600'}`}>
            #{rank}
          </span>
        </div>

        {/* Thumbnail */}
        <VideoArea className="w-28 h-44 sm:w-36 sm:h-52 shrink-0 border-r border-white/5" small />

        {/* Content */}
        <div className="flex-1 flex flex-col sm:flex-row p-5 gap-5 items-start sm:items-center min-w-0">
          <div className="flex-1 space-y-2 min-w-0 w-full">
            <h3 className="line-clamp-2 text-sm font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors leading-snug">
              {ad.title}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {ad.tags?.slice(0, 3).map(tag => (
                <span key={tag} className="rounded-md bg-indigo-500/5 px-2 py-0.5 text-[9px] font-bold text-indigo-400/60 border border-indigo-500/10">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-6 shrink-0 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-white/5 pt-3 sm:pt-0 sm:pl-6">
            <div className="flex flex-col sm:items-end">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">活跃指数</span>
              <span className="text-sm font-black text-indigo-400">{ad.activity_index ?? '—'}</span>
            </div>
            <div className="flex flex-col sm:items-end">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">今日曝光</span>
              <span className="text-sm font-black text-amber-500/80">{formatDisplay(ad.today_exposure)}</span>
            </div>
            <div className="flex flex-col sm:items-end">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">投放天数</span>
              <span className="text-sm font-bold text-slate-300">{ad.delivery_days ?? '—'}</span>
            </div>
            <div className="flex flex-col sm:items-end">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">历史曝光</span>
              <span className="text-sm font-bold text-emerald-500/80">{formatDisplay(ad.impressions)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid layout
  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/50 backdrop-blur-xl transition-all duration-500 hover:scale-[1.015] hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:border-indigo-500/30 cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onClick && onClick(ad)}
    >
      {/* Ranking Badge */}
      <div className={`absolute left-4 top-4 z-20 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl backdrop-blur-md border border-white/10
        ${rank <= 3 ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white' : 'bg-black/60 text-slate-400'}`}>
        {rank <= 3 ? `🔥 Top ${rank}` : `No. ${rank}`}
      </div>

      {/* Video */}
      <VideoArea className="aspect-[9/16]" />

      {/* Stats overlay */}
      <div className="absolute bottom-[160px] left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-5 pt-10 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
              <TrendingUp size={11} className="text-indigo-400" /> 活跃指数
            </span>
            <span className="text-lg font-black text-white drop-shadow-md">{ad.activity_index ?? '—'}</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1 justify-end">
              今日曝光 <Eye size={11} className="text-amber-400" />
            </span>
            <span className="text-sm font-black text-amber-400 drop-shadow-md">{formatDisplay(ad.today_exposure)}</span>
          </div>
        </div>
      </div>

      {/* Content Footer */}
      <div className="flex flex-grow flex-col space-y-4 p-5 bg-gradient-to-b from-transparent to-black/20">
        <h3 className="line-clamp-2 text-sm font-bold leading-relaxed text-slate-200 transition-colors group-hover:text-white">
          {ad.title}
        </h3>
        {ad.tags && ad.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {ad.tags.slice(0, 3).map(tag => (
              <span key={tag} className="rounded-lg bg-indigo-500/10 px-2 py-0.5 text-[9px] font-bold text-indigo-300 border border-indigo-500/20 uppercase tracking-tighter">
                {tag}
              </span>
            ))}
            {ad.tags.length > 3 && (
              <span className="rounded-lg bg-white/5 px-2 py-0.5 text-[9px] font-bold text-slate-500 border border-white/5">
                +{ad.tags.length - 3}
              </span>
            )}
          </div>
        )}
        <div className="flex items-center justify-between border-t border-white/10 pt-3">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">投放时长</span>
            <span className="text-xs font-bold text-slate-300">{ad.delivery_days ?? '—'} Days</span>
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
