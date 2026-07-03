'use client';

import React from 'react';
import { X, MapPin, Trophy, Star, TrendingUp } from 'lucide-react';
import { DatabaseParticipant } from '@/types/database';

interface ParticipantModalProps {
  participant: DatabaseParticipant;
  onClose: () => void;
}

export function ParticipantModal({ participant, onClose }: ParticipantModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-black/60">
      <div className="relative w-full max-w-4xl bg-[#050B14] border border-[#262626] rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-white hover:text-[#d4af37] transition-colors z-20 bg-black/40 p-2 rounded-full backdrop-blur-sm"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col lg:flex-row h-full max-h-[90vh] overflow-hidden">
          {/* Media Side */}
          <div className="w-full lg:w-1/2 aspect-[4/5] lg:aspect-auto relative bg-[#0a0a0a]">
            <img src={participant.media_urls.images[0]} alt={participant.full_name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-transparent to-transparent lg:hidden" />
          </div>

          {/* Info Side */}
          <div className="w-full lg:w-1/2 p-8 md:p-12 overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-3 mb-4">
               {participant.ranking && (
                <div className="bg-[#d4af37] text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                  <Trophy size={12} /> Rank #{participant.ranking}
                </div>
               )}
               <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${participant.status === 'Approved' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                 {participant.status}
               </div>
            </div>

            <h3 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight leading-none mb-2">
              {participant.full_name}
            </h3>
            <p className="text-[#d4af37] text-xl font-serif italic mb-8">"{participant.nickname}"</p>

            <div className="grid grid-cols-2 gap-6 mb-10">
              <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-[#262626]">
                <span className="block text-[9px] text-[#A3A3A3] uppercase font-black tracking-widest mb-1.5 flex items-center gap-2">
                  <Star size={10} className="text-[#d4af37]" /> Current Votes
                </span>
                <span className="text-2xl font-black text-white">{participant.vote_count.toLocaleString()}</span>
              </div>
              <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-[#262626]">
                <span className="block text-[9px] text-[#A3A3A3] uppercase font-black tracking-widest mb-1.5 flex items-center gap-2">
                  <TrendingUp size={10} className="text-[#A3A3A3]" /> Eligibility
                </span>
                <span className="text-base font-black text-white tracking-widest uppercase">Verified</span>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h4 className="text-white text-xs font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#d4af37] rounded-full" /> Biography
                </h4>
                <p className="text-[#A3A3A3] text-sm leading-relaxed">{participant.bio}</p>
              </div>

              <div>
                <h4 className="text-white text-xs font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#d4af37] rounded-full" /> Details
                </h4>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(participant.metadata).map(([key, value]) => (
                    <div key={key} className="bg-[#1a1a1a] border border-[#262626] px-4 py-2 rounded-xl">
                      <span className="text-[9px] text-[#A3A3A3] uppercase block font-bold">{key}</span>
                      <span className="text-xs text-white font-black">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-12 flex flex-col gap-4">
              <button 
                onClick={onClose}
                className="w-full bg-[#d4af37] text-black font-black uppercase tracking-widest py-5 rounded-2xl shadow-[0_0_30px_rgba(212,175,55,0.2)] hover:scale-[1.02] transition-all"
              >
                Close & Returns
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
