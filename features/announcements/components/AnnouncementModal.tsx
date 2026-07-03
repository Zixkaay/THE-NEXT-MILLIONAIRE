'use client';

import React from 'react';
import { X, Megaphone, Video } from 'lucide-react';
import { DatabaseAnnouncement } from '@/types/database';

interface AnnouncementModalProps {
  announcement: DatabaseAnnouncement;
  onClose: () => void;
}

export function AnnouncementModal({ announcement, onClose }: AnnouncementModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-black/60">
      <div className="relative w-full max-w-2xl bg-[#050B14] border border-[#262626] rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-white hover:text-[#d4af37] transition-colors z-20 bg-black/40 p-2 rounded-full backdrop-blur-sm"
        >
          <X size={24} />
        </button>

        <div className="max-h-[85vh] overflow-y-auto custom-scrollbar">
          {announcement.image_url && (
            <div className="w-full aspect-video overflow-hidden relative">
              <img src={announcement.image_url} alt={announcement.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-transparent to-transparent" />
            </div>
          )}

          <div className="p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#d4af37] text-black p-2 rounded-lg">
                <Megaphone size={20} />
              </div>
              <span className="text-[#d4af37] text-xs font-black uppercase tracking-[0.3em]">Official Broadcast</span>
            </div>

            <h3 className="text-2xl md:text-4xl font-serif text-white tracking-tight leading-tight mb-6">
              {announcement.title}
            </h3>

            <div className="text-[#A3A3A3] text-base md:text-lg leading-relaxed space-y-6 mb-10">
              {announcement.content.split('\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {announcement.video_url && (
              <a 
                href={announcement.video_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-4 bg-[#1a1a1a] border border-[#262626] p-6 rounded-2xl group hover:border-[#d4af37] transition-all"
              >
                <div className="bg-red-600 text-white p-4 rounded-full group-hover:scale-110 transition-transform">
                  <Video size={24} />
                </div>
                <div>
                  <span className="block text-white font-bold uppercase tracking-widest text-sm mb-1">Watch Video Update</span>
                  <span className="block text-[#A3A3A3] text-xs">A video message accompanied this broadcast</span>
                </div>
              </a>
            )}

            <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-[#A3A3A3] font-mono font-bold uppercase tracking-widest">
               <span>ID: {announcement.id}</span>
               <span>Broadcasted on {new Date(announcement.created_at).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
