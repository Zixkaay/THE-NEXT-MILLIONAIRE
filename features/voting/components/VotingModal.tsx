'use client';

import React from 'react';
import { X, DollarSign } from 'lucide-react';
import { DatabaseParticipant } from '@/types/database';
import VoteWidget from './VoteWidget';

interface VotingModalProps {
  participant: DatabaseParticipant;
  onClose: () => void;
  votePrice: number;
}

export function VotingModal({ participant, onClose, votePrice }: VotingModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-black/60">
      <div className="relative w-full max-w-lg bg-[#050B14] border border-[#262626] rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-[#A3A3A3] hover:text-white transition-colors z-10"
        >
          <X size={24} />
        </button>

        <div className="p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border border-[#d4af37]">
              <img src={participant.media_urls.images[0]} alt={participant.full_name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-white text-2xl font-black uppercase tracking-tight">{participant.full_name}</h3>
              <p className="text-[#d4af37] font-serif italic">"{participant.nickname}"</p>
            </div>
          </div>

          <VoteWidget participant_id={participant.id} vote_price={votePrice} />
          
          <p className="mt-6 text-[10px] text-[#A3A3A3] text-center uppercase tracking-widest">
            Secure payments processed via Paystack. Your votes directly support this participant's journey.
          </p>
        </div>
      </div>
    </div>
  );
}
