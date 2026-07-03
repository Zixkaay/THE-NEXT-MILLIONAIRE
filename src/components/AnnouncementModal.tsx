'use client';

import { X, Megaphone, Calendar } from 'lucide-react';
import { DatabaseAnnouncement as Announcement } from '@/types/database';

interface AnnouncementModalProps {
  announcement: Announcement;
  onClose: () => void;
}

export function AnnouncementModal({ announcement, onClose }: AnnouncementModalProps) {
  // If video URL exists, check if it's YouTube so we can render an iframe or a clean link
  const renderVideoPlayer = (url: string) => {
    let embedUrl = url;
    const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
    
    if (isYoutube) {
      // Extract youtube video ID
      let videoId = '';
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      if (match && match[2].length === 11) {
        videoId = match[2];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
      
      return (
        <div className="aspect-video w-full rounded-2xl overflow-hidden border border-[#1c2433] bg-black shadow-lg">
          <iframe
            src={embedUrl}
            title={announcement.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      );
    }

    // Fallback standard video player
    return (
      <div className="aspect-video w-full rounded-2xl overflow-hidden border border-[#1c2433] bg-black shadow-lg">
        <video src={url} controls className="w-full h-full object-contain" />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-[#050811] overflow-y-auto animate-in fade-in duration-300">
      
      {/* Absolute Decorative Golden Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#d4af37]/5 rounded-full blur-[180px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-[#a67c00]/5 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Persistent Close Button */}
      <button 
        onClick={onClose} 
        className="fixed top-6 right-6 md:top-8 md:right-8 z-[100000] w-12 h-12 bg-black/90 hover:bg-[#d4af37] border border-[#232B3A] text-white hover:text-black rounded-full flex items-center justify-center transition-all shadow-[0_4px_30px_rgba(0,0,0,0.8)] hover:scale-105 active:scale-95 cursor-pointer"
        title="Close Announcement"
        id="close-announcement-btn"
      >
        <X size={20} className="stroke-[2.5px]" />
      </button>

      {/* Main Container Frame */}
      <div className="max-w-4xl mx-auto px-6 py-20 md:py-28 relative z-10">
        
        <div className="space-y-8">
          
          {/* Header Media */}
          {announcement.image_url && (
            <div className="relative rounded-3xl overflow-hidden border border-[#1c2433] bg-[#0a0d16] shadow-xl aspect-[21/9]">
              <img 
                src={announcement.image_url} 
                alt={announcement.title} 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            </div>
          )}

          {/* Title block */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[#d4af37] bg-[#d4af37]/10 border border-[#d4af37]/35 text-[9px] uppercase font-black px-3 py-1.5 rounded-full tracking-[0.2em] flex items-center gap-1.5 shadow-sm">
                <Megaphone size={10} /> Official Announcement
              </span>
              <span className="text-[#A3A3A3] text-[10px] font-mono flex items-center gap-1">
                <Calendar size={10} />
                {new Date(announcement.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-tight">
              {announcement.title}
            </h1>
          </div>

          {/* Body Content */}
          <div className="border-t border-[#1c2433] pt-6">
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-light first-letter:text-3xl first-letter:font-black first-letter:text-[#d4af37] first-letter:mr-1">
              {announcement.content}
            </p>
          </div>

          {/* Attached Performance/Promo Video */}
          {announcement.video_url && (
            <div className="space-y-3 pt-6 border-t border-[#1c2433]">
              <h3 className="text-white font-black uppercase tracking-widest text-xs sm:text-sm">Broadcast Video Briefing</h3>
              {renderVideoPlayer(announcement.video_url)}
            </div>
          )}
          
        </div>

      </div>

    </div>
  );
}
