'use client';

import { X, Play, Trophy, ShieldAlert, ArrowRight } from 'lucide-react';
import { DatabaseParticipant } from '@/types/database';
import { useState } from 'react';

interface ParticipantModalProps {
  participant: DatabaseParticipant;
  onClose: () => void;
}

export function ParticipantModal({ participant, onClose }: ParticipantModalProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [voteAmount, setVoteAmount] = useState(10);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [valError, setValError] = useState<string | null>(null);

  const isEvicted = participant.status === 'evicted';

  const handleVote = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setValError('Please enter your email to receive your official payment receipt.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setValError('Please provide a valid email address.');
      return;
    }

    setValError(null);
    setIsSubmitting(true);

    try {
      const ghsTotal = voteAmount * 5; // GHC 5 per Vote
      
      console.log('Mocking payment initialization for:', {
        email: trimmedEmail,
        amountGHC: ghsTotal,
        metadata: {
          type: 'voting',
          participantId: participant.id,
          votesAdded: voteAmount,
          full_name: participant.full_name
        }
      });

      // Instead of routing to backend, we just alert
      alert(`Demo Mode: Processing Paystack payment for GHC ${ghsTotal}.`);
      
      // Navigate or close as if it worked
      onClose();
    } catch (err: any) {
      setValError(err?.message || 'Transaction portal connection error. Try again later.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-[#050811] overflow-y-auto animate-in fade-in duration-300">
      
      {/* Absolute Decorative Golden Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#d4af37]/5 rounded-full blur-[180px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-[#a67c00]/5 rounded-full blur-[150px] pointer-events-none"></div>

      {/* FLOAT-FIXED PERSISTENT CLOSE BUTTON */}
      <button 
        onClick={onClose} 
        className="fixed top-6 right-6 md:top-8 md:right-8 z-[100000] w-12 h-12 bg-black/90 hover:bg-[#d4af37] border border-[#232B3A] text-white hover:text-black rounded-full flex items-center justify-center transition-all shadow-[0_4px_30px_rgba(0,0,0,0.8)] hover:scale-105 active:scale-95 cursor-pointer"
        title="Close Profile"
        id="close-profile-btn"
      >
        <X size={20} className="stroke-[2.5px]" />
      </button>

      {/* MAIN CONTENT FRAME */}
      <div className="max-w-5xl mx-auto px-6 py-20 md:py-28 relative z-10">
        
        {/* Gridded Column Showcase Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-start">
          
          {/* Left Side: Photo Frame Container (Sticky on Desktop) */}
          <div className="md:col-span-5 md:sticky md:top-28">
            <div className="relative rounded-3xl overflow-hidden border border-[#1E2533] bg-[#0A0D16] shadow-[0_20px_50px_rgba(0,0,0,0.6)] aspect-[4/5] sm:aspect-[4/5] md:aspect-auto">
              {isEvicted && (
                <div className="absolute top-6 left-6 z-20 bg-[#ef4444] text-white font-black text-xs uppercase tracking-widest px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
                  <ShieldAlert size={14} /> Eliminated
                </div>
              )}
              
              <img 
                src={participant.media_urls.images[0]} 
                alt={participant.full_name} 
                className={`w-full h-full object-cover md:min-h-[500px] ${isEvicted ? 'grayscale opacity-50' : ''}`} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              
              {/* Bottom Visual Tag */}
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-gray-400 text-[10px] uppercase font-bold tracking-widest block mb-1">DESIGNATION</span>
                <p className="text-[#D4AF37] font-black text-lg uppercase tracking-wider">{participant.nickname}</p>
              </div>
            </div>
          </div>

          {/* Right Side: Deep Profiles, Stats & Interactions */}
          <div className="md:col-span-7 flex flex-col">
            
            {/* Title Block */}
            <div className="mb-8">
              <span className="text-[#D4AF37] font-mono text-xs uppercase tracking-[0.3em] font-black block mb-2">OFFICIAL PROFILE</span>
              <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight leading-none mb-3">
                {participant.full_name}
              </h2>
              <p className="text-[#A3A3A3] font-serif italic text-lg md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#A67C00]">
                "{participant.nickname}"
              </p>
            </div>

            {/* Metric Status Badges */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="bg-[#101622] border border-[#1C2433] p-5 sm:p-6 rounded-2xl shadow-sm">
                <span className="text-gray-400 text-[10px] uppercase tracking-widest font-black block mb-2">Power Votes Cast</span>
                <span className="text-3xl font-black text-white tracking-tight">{participant.vote_count.toLocaleString()}</span>
              </div>
              <div className="bg-[#101622] border border-[#1C2433] p-5 sm:p-6 rounded-2xl shadow-sm">
                <span className="text-gray-400 text-[10px] uppercase tracking-widest font-black block mb-2">Current Rank</span>
                <span className="text-3xl font-black text-[#D4AF37] tracking-tight">
                  {participant.ranking ? `#${participant.ranking}` : 'Unranked'}
                </span>
              </div>
            </div>

            {/* Complete Interactive Bio */}
            <div className="mb-10">
              <span className="text-[#D4AF37] text-[10px] uppercase tracking-widest font-black block mb-3 border-b border-[#232B3A] pb-2">BIOGRAPHY & MISSION</span>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-light font-sans first-letter:text-3xl first-letter:font-black first-letter:text-[#D4AF37] first-letter:mr-1">
                {participant.bio}
              </p>
            </div>

            {/* Meta Specifications */}
            <div className="grid grid-cols-2 gap-6 mb-10 bg-[#101622]/40 border border-[#1C2433]/50 p-6 rounded-2xl">
              {Object.entries(participant.metadata).map(([key, val]) => (
                <div key={key}>
                  <span className="text-gray-400 text-[10px] uppercase tracking-widest font-black block mb-1">{key}</span>
                  <span className="text-white text-sm font-bold tracking-wide">{String(val)}</span>
                </div>
              ))}
            </div>

            {/* Performance Video Playbacks Archive */}
            <div className="mb-12">
              <h3 className="text-white font-black uppercase tracking-widest text-xs sm:text-sm mb-5 border-b border-[#232B3A] pb-2">PERFORMANCE BROADCASTS</h3>
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-[#101622] aspect-video rounded-xl flex items-center justify-center border border-[#1C2433] hover:border-[#D4AF37]/60 cursor-pointer group transition-all duration-300 shadow-md">
                    <div className="w-12 h-14 rounded-full bg-[#0A0E17] border border-[#232B3A] group-hover:bg-[#D4AF37] group-hover:border-[#D4AF37] flex items-center justify-center text-[#D4AF37] group-hover:text-black transition-all">
                      <Play size={18} className="ml-1 fill-current" />
                    </div>
                 </div>
                 <div className="bg-[#101622] aspect-video rounded-xl flex items-center justify-center border border-[#1C2433] hover:border-[#D4AF37]/60 cursor-pointer group transition-all duration-300 shadow-md">
                    <div className="w-12 h-14 rounded-full bg-[#0A0E17] border border-[#232B3A] group-hover:bg-[#D4AF37] group-hover:border-[#D4AF37] flex items-center justify-center text-[#D4AF37] group-hover:text-black transition-all">
                      <Play size={18} className="ml-1 fill-current" />
                    </div>
                 </div>
              </div>
            </div>

            {/* Monetized Support Box */}
            <div className="p-1 w-full bg-[#101622] border border-[#1C2433] rounded-3xl overflow-hidden shadow-lg mt-auto">
              {!isEvicted ? (
                isVoting ? (
                  <div className="p-6 bg-[#0E131E] border border-[#232B3A]/30 rounded-[1.4rem] animate-in slide-in-from-bottom-4 duration-300 space-y-4">
                    <h4 className="text-[#D4AF37] font-mono text-[11px] uppercase tracking-widest font-black mb-1">CAST POWER VOTES IN REAL-TIME</h4>
                    
                    <div className="flex flex-wrap gap-2.5">
                      {[10, 50, 100, 500].map(v => (
                        <button 
                          key={v} 
                          disabled={isSubmitting}
                          onClick={() => { setVoteAmount(v); setValError(null); }} 
                          className={`flex-1 min-w-[60px] py-3.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 disabled:opacity-40 ${voteAmount === v ? 'bg-gradient-to-r from-[#D4AF37] to-[#A67C00] text-black shadow-md' : 'bg-[#101622] text-gray-400 border border-[#1C2433] hover:text-white'}`}
                        >
                          {v} Votes
                        </button>
                      ))}
                    </div>

                    {/* Email Input Field for Checkout Receipt */}
                    <div className="text-left space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pl-2 font-mono">SUPPORTER EMAIL</label>
                      <input 
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setValError(null); }}
                        placeholder="Enter your email address"
                        disabled={isSubmitting}
                        className="w-full bg-[#101622] border border-[#232B3A] rounded-xl px-4 py-3 text-xs text-white placeholder:text-zinc-500 outline-none focus:border-[#D4AF37] transition-all"
                      />
                    </div>

                    {/* Validation Error Alerts */}
                    {valError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] uppercase font-semibold tracking-wider rounded-xl text-left">
                        {valError}
                      </div>
                    )}
                    
                    <button 
                      onClick={handleVote} 
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#A67C00] text-black font-black uppercase tracking-widest py-4 rounded-xl hover:opacity-95 transition-all text-xs flex justify-center items-center gap-2 shadow-[0_4px_20px_rgba(212,175,55,0.25)] disabled:opacity-50"
                    >
                      {isSubmitting ? 'SECURE GATEWAY ROUTING...' : `Initialize Paystack GHC ${voteAmount * 5}`} <ArrowRight size={14} className="stroke-[3px]" />
                    </button>
                    
                    <button 
                      onClick={() => !isSubmitting && setIsVoting(false)} 
                      disabled={isSubmitting}
                      className="w-full text-gray-500 hover:text-white text-[10px] font-black uppercase tracking-widest py-1 transition-colors disabled:opacity-30"
                    >
                      Cancel Transaction
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsVoting(true)} 
                    className="w-full bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#A67C00] text-black font-black uppercase tracking-widest py-5 rounded-[1.4rem] hover:opacity-95 transition-opacity flex justify-center items-center gap-3 shadow-[0_8px_30px_rgba(212,175,55,0.3)]"
                  >
                    <Trophy size={18} className="stroke-[2.5px]" /> Cast Power Votes
                  </button>
                )
              ) : (
                <div className="bg-red-500/10 border border-red-500/25 p-5 rounded-[1.4rem] text-red-500 text-center font-black uppercase tracking-wider text-xs font-mono">
                  Power Voting Terminated &bull; Contestant Eliminated
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
