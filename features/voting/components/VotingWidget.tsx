'use client';

import React from 'react';
import { Trophy, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import Link from 'next/link';

export function VotingWidget() {
  const { participants, settings } = useAppStore();
  const rank1 = participants.find(p => p.ranking === 1 && p.status === 'Approved');

  if (rank1) {
    return (
      <div className="w-full max-w-md bg-[#0a0a0a] border-2 border-[#d4af37] rounded-[2.5rem] overflow-hidden shadow-[0_0_30px_rgba(212,175,55,0.2)] animate-in fade-in zoom-in duration-500">
         <div className="relative h-64 overflow-hidden">
           <div className="absolute top-4 left-4 bg-black/80 text-[#d4af37] font-black text-xs uppercase px-4 py-2 rounded-lg border border-[#d4af37] z-10 backdrop-blur">
             1st Runner
           </div>
           <img src={rank1.media_urls.images[0]} alt={rank1.full_name} className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
         </div>
         <div className="p-8 text-center bg-[#0a0a0a] relative -mt-4">
            <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-1">{rank1.full_name}</h2>
            <span className="text-[#d4af37] text-sm font-serif italic mb-6 block">"{rank1.nickname}"</span>
            
            <div className="flex justify-center items-center gap-4 mb-8 bg-[#1a1a1a] p-3 rounded-xl border border-[#333]">
               <span className="text-[#a3a3a3] text-xs uppercase font-bold tracking-widest">Total Votes</span>
              <span className="text-white font-black text-lg">{rank1.vote_count.toLocaleString()}</span>
            </div>

            <Link href="/contestants" className="block w-full bg-gradient-to-r from-[#D4AF37] to-[#A67C00] text-black font-black uppercase tracking-widest py-4 rounded-xl text-center hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(212,175,55,0.4)]">
              Vote Now
            </Link>
         </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-[#0a0a0a] border border-[#262626] rounded-[2.5rem] p-8 text-center shadow-xl">
       <CheckCircle2 className="text-[#A3A3A3] w-16 h-16 mx-auto mb-4 opacity-50" />
       <h2 className="text-[#d4af37] text-2xl font-black uppercase mb-2">Voting Active</h2>
       <p className="text-[#A3A3A3] text-sm leading-relaxed mb-6">Support your favorite contestants by casting your votes now. The competition is heating up!</p>
       <Link href="/contestants" className="block w-full bg-[#1a1a1a] border border-[#333] text-white hover:border-[#d4af37] font-bold text-xs uppercase tracking-widest py-4 rounded-xl text-center transition-colors">
         View Contestants
       </Link>
    </div>
  );
}
