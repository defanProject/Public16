import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Play, Heart, MessageCircle, Share2, Download, X, Search, Copy, Check } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

interface TrendingVideo {
  id: string;
  title: string;
  cover: string;
  origin_cover?: string;
  no_watermark?: string;
  watermark?: string;
  duration?: number;
  url?: string;
  author: {
    nickname: string;
    unique_id: string;
    avatar: string;
  };
  stats: {
    plays?: number;
    play_count?: number;
    likes?: number;
    digg_count?: number;
    comments?: number;
    comment_count?: number;
    shares?: number;
    share_count?: number;
  };
}

export default function Trending() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { lang } = useParams();

  const [videos, setVideos] = useState<TrendingVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState('trending');
  const [inputVal, setInputVal] = useState('trending');
  const [count, setCount] = useState(8);
  const [playerVideo, setPlayerVideo] = useState<TrendingVideo | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchVideos = async (kw: string, cnt: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('https://snaptok.lol/api/tiktok/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: kw, count: cnt }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list: TrendingVideo[] = Array.isArray(data)
        ? data
        : data.data ?? data.videos ?? data.result ?? [];
      setVideos(list);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos(keyword, count);
  }, [keyword, count]);

  const handleSearch = () => {
    setKeyword(inputVal.trim() || 'trending');
  };

  const formatNumber = (num?: number) => {
    const n = num ?? 0;
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return n.toString();
  };

  const getStats = (v: TrendingVideo) => ({
    plays: v.stats.plays ?? v.stats.play_count ?? 0,
    likes: v.stats.likes ?? v.stats.digg_count ?? 0,
    comments: v.stats.comments ?? v.stats.comment_count ?? 0,
    shares: v.stats.shares ?? v.stats.share_count ?? 0,
  });

  const getVideoUrl = (v: TrendingVideo) =>
    v.no_watermark || v.watermark || '';

  const getPageUrl = (v: TrendingVideo) =>
    v.url || `https://www.tiktok.com/@${v.author.unique_id}/video/${v.id}`;

  const handleCopy = async (v: TrendingVideo) => {
    const url = getPageUrl(v);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      prompt('Copy this link:', url);
    }
    setCopiedId(v.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-black text-gray-900 mb-4"
        >
          {t('trending.title', 'Trending')}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-500 font-bold"
        >
          {t('trending.subtitle', 'Discover what\'s hot right now')}
        </motion.p>
      </div>

      {/* Search bar */}
      <div className="flex gap-3 mb-6 max-w-xl mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search keyword..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>
        <select
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none bg-white"
        >
          {[4, 8, 12, 20].map((n) => (
            <option key={n} value={n}>{n} videos</option>
          ))}
        </select>
        <button
          onClick={handleSearch}
          className="px-4 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors"
        >
          Search
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="text-center text-red-500 font-bold mb-6">{error}</p>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading
          ? Array.from({ length: count }).map((_, i) => (
              <div key={i} className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100 animate-pulse">
                <div className="aspect-[3/4] bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                      <div className="h-2 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-100 rounded w-4/5" />
                </div>
              </div>
            ))
          : videos.map((video, index) => {
              const s = getStats(video);
              const isCopied = copiedId === video.id;
              return (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100 group hover:shadow-2xl transition-all"
                >
                  {/* Thumbnail */}
                  <div
                    className="relative aspect-[3/4] overflow-hidden cursor-pointer"
                    onClick={() => setPlayerVideo(video)}
                  >
                    <img
                      src={video.cover || video.origin_cover || ''}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setPlayerVideo(video); }}
                        className="w-full py-2.5 bg-white text-black font-black rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors text-sm"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>Play Video</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/${lang}/tiktok-download?url=${getPageUrl(video)}`);
                        }}
                        className="w-full py-2.5 bg-black/60 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-black/80 transition-colors text-sm"
                      >
                        <Download className="w-4 h-4" />
                        <span>{t('trending.downloadNow', 'Download')}</span>
                      </button>
                    </div>

                    {/* Play badge */}
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 text-white">
                      <Play className="w-3 h-3 fill-current" />
                      <span className="text-[10px] font-bold">{formatNumber(s.plays)}</span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={video.author.avatar}
                        alt={video.author.nickname}
                        className="w-8 h-8 rounded-full border border-gray-100 flex-shrink-0"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                      <div className="overflow-hidden">
                        <p className="text-xs font-black text-gray-900 truncate">{video.author.nickname}</p>
                        <p className="text-[10px] text-gray-400 font-bold truncate">@{video.author.unique_id}</p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 font-bold line-clamp-2 leading-tight">
                      {video.title}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                      <div className="flex items-center gap-1 text-gray-400">
                        <Heart className="w-3 h-3" />
                        <span className="text-[10px] font-bold">{formatNumber(s.likes)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <MessageCircle className="w-3 h-3" />
                        <span className="text-[10px] font-bold">{formatNumber(s.comments)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Share2 className="w-3 h-3" />
                        <span className="text-[10px] font-bold">{formatNumber(s.shares)}</span>
                      </div>
                    </div>

                    {/* Copy link button */}
                    <button
                      onClick={() => handleCopy(video)}
                      className={`w-full py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-bold border transition-colors ${
                        isCopied
                          ? 'bg-green-50 text-green-600 border-green-200'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {isCopied ? 'Copied!' : 'Copy Link'}
                    </button>
                  </div>
                </motion.div>
              );
            })}
      </div>

      {/* Video Player Modal */}
      <AnimatePresence>
        {playerVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setPlayerVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-black rounded-2xl overflow-hidden max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setPlayerVideo(null)}
                className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <video
                src={getVideoUrl(playerVideo)}
                controls
                autoPlay
                playsInline
                className="w-full max-h-[70vh] block"
              />
              <div className="px-4 py-3 bg-black/80">
                <p className="text-white text-xs font-bold line-clamp-2">{playerVideo.title}</p>
                <p className="text-gray-400 text-[10px] mt-1">@{playerVideo.author.unique_id}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}