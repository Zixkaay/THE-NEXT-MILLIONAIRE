'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Trophy } from 'lucide-react';
import Link from 'next/link';

export const GoldActionBar = () => {
  const { settings } = useAppStore();
  const [timeLeft, setTimeLeft] = useState({ days: '00', hours: '00', mins: '00', secs: '00' });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!settings.countdown_target) {
      setIsExpired(true);
      return;
    }
    const target = new Date(settings.countdown_target).getTime();
    if (isNaN(target)) {
      setIsExpired(true);
      return;
    }
    
    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = target - now;

      if (distance <= 0) {
        setIsExpired(true);
        setTimeLeft({ days: '00', hours: '00', mins: '00', secs: '00' });
        return true;
      }

      setIsExpired(false);
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)).toString().padStart(2, '0'),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0'),
        mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0'),
        secs: Math.floor((distance % (1000 * 60)) / 1000).toString().padStart(2, '0')
      });
      return false;
    };

    const done = updateTimer();
    if (done) return;

    const interval = setInterval(() => {
      const done = updateTimer();
      if (done) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [settings.countdown_target]);

  // A CSS variable helper for the chamfered clip-path notch (reduced to 8px for sharper corners and less space waste)
  const chamferedClipPath = "polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px), 0 8px)";

  const isCountdownOff = settings.countdown_active === false;
  const showHaltedState = isExpired || isCountdownOff;

  return (
    <div className="w-full bg-gradient-to-r from-[#B98A27] via-[#DFB847] to-[#B98A27] CustomGoldBar relative z-30 shadow-[0_10px_20px_rgba(0,0,0,0.5)] overflow-hidden">
      <div className="max-w-[1500px] mx-auto px-2 sm:px-4 md:px-8 py-2.5 md:py-4 flex flex-row items-center gap-2 sm:gap-4 md:gap-6">
        
        {/* Safe Zone Shield (Matches Logo Width Precisely) */}
        <div className="w-[90px] sm:w-[120px] md:w-[180px] lg:w-[220px] shrink-0 h-full"></div>
        
        {/* Actions Wrapper */}
        <div className="flex-1 flex flex-col justify-center">

          {/* ========================================================
              MOBILE & TABLET LAYOUT (Hides on lg screens and up)
              - No "Next Audition in:" text
              - No Make Appt Button
              - No Prize Box
              - Stretched Timer
              ======================================================== */}
          <div className="flex lg:hidden flex-row items-center justify-start w-full">
            <div className="w-full h-full shrink-0">
              <div 
                className="bg-gradient-to-b from-[#FFF2B2] via-[#D4AF37] to-[#8C6600] p-[1.5px] shadow-2xl relative w-full"
                style={{ clipPath: chamferedClipPath }}
              >
                 <div 
                   className="bg-gradient-to-br from-[#0c1b33] to-[#040810] flex flex-col justify-center px-1 sm:px-3 pt-3.5 pb-2 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] min-w-0 w-full"
                   style={{ clipPath: chamferedClipPath }}
                 >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-[2px] bg-gradient-to-b from-[#FFF2B2] via-[#E4C567] to-[#B89233] text-[#0c1b33] font-black text-[6px] sm:text-[7px] px-2 sm:px-4 py-0.5 rounded-b-md border-x-[1px] border-b-[1px] border-[#8C6600] shadow-sm uppercase tracking-widest whitespace-nowrap leading-tight">
                      {settings.countdown_event_name || 'Audition Countdown'}
                    </div>

                    {showHaltedState ? (
                      <div className="flex flex-col items-center justify-center text-center mt-2.5 px-2 py-1 min-h-[36px]">
                        <span className="text-[9px] sm:text-[10px] font-black text-[#d4af37] uppercase tracking-[0.18em] animate-pulse">
                          {settings.countdown_event_name || 'AUDITION DAY'}
                        </span>
                        <span className="text-[8px] font-mono text-white/60 tracking-wider mt-0.5">HALTED AT ZERO (00d : 00h : 00m : 00s)</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-center mt-1 sm:mt-1.5 w-full max-w-[500px] mx-auto px-1 sm:px-2 pb-0.5">
                        <div className="flex flex-col items-center leading-none border border-[#d4af37]/40 bg-black/40 rounded px-1.5 sm:px-3 py-1 sm:py-1.5 min-w-[36px] sm:min-w-[48px] shadow-inner">
                          <span className="text-sm sm:text-lg font-extrabold text-[#d4af37] tracking-widest drop-shadow-md leading-none">{timeLeft.days}</span>
                          <span className="text-[5px] sm:text-[6px] text-white font-semibold uppercase tracking-[0.2em] mt-1 opacity-90">Days</span>
                        </div>
                        <span className="text-[10px] sm:text-xs text-white/30 font-light leading-none -mt-4 mx-0.5">|</span>
                        
                        <div className="flex flex-col items-center leading-none border border-[#d4af37]/40 bg-black/40 rounded px-1.5 sm:px-3 py-1 sm:py-1.5 min-w-[36px] sm:min-w-[48px] shadow-inner">
                          <span className="text-sm sm:text-lg font-extrabold text-[#d4af37] tracking-widest drop-shadow-md leading-none">{timeLeft.hours}</span>
                          <span className="text-[5px] sm:text-[6px] text-white font-semibold uppercase tracking-[0.2em] mt-1 opacity-90">Hours</span>
                        </div>
                        <span className="text-[10px] sm:text-xs text-white/30 font-light leading-none -mt-4 mx-0.5">|</span>
                        
                        <div className="flex flex-col items-center leading-none border border-[#d4af37]/40 bg-black/40 rounded px-1.5 sm:px-3 py-1 sm:py-1.5 min-w-[36px] sm:min-w-[48px] shadow-inner">
                          <span className="text-sm sm:text-lg font-extrabold text-[#d4af37] tracking-widest drop-shadow-md leading-none">{timeLeft.mins}</span>
                          <span className="text-[5px] sm:text-[6px] text-white font-semibold uppercase tracking-[0.2em] mt-1 opacity-90">Mins</span>
                        </div>
                        <span className="text-[10px] sm:text-xs text-white/30 font-light leading-none -mt-4 mx-0.5">|</span>
                        
                        <div className="flex flex-col items-center leading-none border border-[#d4af37]/40 bg-black/40 rounded px-1.5 sm:px-3 py-1 sm:py-1.5 min-w-[36px] sm:min-w-[48px] shadow-inner">
                          <span className="text-sm sm:text-lg font-extrabold text-[#d4af37] tracking-widest drop-shadow-md leading-none">{timeLeft.secs}</span>
                          <span className="text-[5px] sm:text-[6px] text-white font-semibold uppercase tracking-[0.2em] mt-1 opacity-90">Secs</span>
                        </div>
                      </div>
                    )}
                 </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              DESKTOP LAYOUT (Hides on screens smaller than lg)
              - Has "Next Audition in:" text
              - Includes Make Appt Button
              - Includes explicit Prize Box
              - Compresses timer to regular size
              ======================================================== */}
          <div className="hidden lg:flex flex-row flex-wrap items-end justify-start gap-x-6 lg:gap-x-8 gap-y-4 w-full">
            
            {/* Desktop Countdown Area */}
            <div className="flex flex-col items-start shrink-0">
              <span className="text-[#0c1b33] font-serif italic font-extrabold text-sm lg:text-base mb-1 drop-shadow-sm leading-none pl-1 text-left">
                {!showHaltedState ? 'Next Event in:' : 'Current Event:'}
              </span>
              
              <div 
                className="bg-gradient-to-b from-[#FFF2B2] via-[#D4AF37] to-[#8C6600] p-[2px] shadow-2xl relative"
                style={{ clipPath: chamferedClipPath }}
              >
                 <div 
                   className="bg-gradient-to-br from-[#0c1b33] to-[#040810] flex flex-col justify-center px-4 md:px-5 pt-4 pb-2 md:pt-5 md:pb-2.5 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] min-w-[260px] lg:min-w-[320px]"
                   style={{ clipPath: chamferedClipPath }}
                 >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-[2px] bg-gradient-to-b from-[#FFF2B2] via-[#E4C567] to-[#B89233] text-[#0c1b33] font-black text-[9px] lg:text-[11px] px-3 md:px-6 py-0.5 rounded-b-lg border-x-2 border-b-2 border-[#8C6600] shadow-sm uppercase tracking-widest whitespace-nowrap leading-tight">
                      {settings.countdown_event_name || 'Audition Countdown'}
                    </div>

                    {showHaltedState ? (
                      <div className="flex flex-col items-center justify-center text-center mt-2 px-4 py-1 min-h-[55px]">
                        <span className="text-xs lg:text-sm font-black text-[#d4af37] uppercase tracking-[0.22em] animate-pulse">
                          {settings.countdown_event_name || 'AUDITION DAY'}
                        </span>
                        <span className="text-[10px] font-mono text-white/50 tracking-widest mt-1.5 uppercase">Halted at Zero (00d : 00h : 00m : 00s)</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center text-center mt-1 lg:mt-1.5 gap-1.5 lg:gap-2 pb-0.5">
                        <div className="flex flex-col items-center leading-none border border-[#d4af37]/40 bg-black/40 rounded lg:rounded-md px-3 lg:px-4 py-1.5 lg:py-2 min-w-[50px] lg:min-w-[65px] shadow-inner">
                          <span className="text-2xl lg:text-3xl font-extrabold text-[#d4af37] tracking-widest drop-shadow-md leading-none">{timeLeft.days}</span>
                          <span className="text-[7px] lg:text-[8px] text-white font-bold uppercase tracking-[0.2em] mt-1.5 lg:mt-2 opacity-90">Days</span>
                        </div>
                        <span className="text-lg lg:text-xl text-white/20 font-light leading-none -mt-4 lg:-mt-5">|</span>
                        
                        <div className="flex flex-col items-center leading-none border border-[#d4af37]/40 bg-black/40 rounded lg:rounded-md px-3 lg:px-4 py-1.5 lg:py-2 min-w-[50px] lg:min-w-[65px] shadow-inner">
                          <span className="text-2xl lg:text-3xl font-extrabold text-[#d4af37] tracking-widest drop-shadow-md leading-none">{timeLeft.hours}</span>
                          <span className="text-[7px] lg:text-[8px] text-white font-bold uppercase tracking-[0.2em] mt-1.5 lg:mt-2 opacity-90">Hours</span>
                        </div>
                        <span className="text-lg lg:text-xl text-white/20 font-light leading-none -mt-4 lg:-mt-5">|</span>
                        
                        <div className="flex flex-col items-center leading-none border border-[#d4af37]/40 bg-black/40 rounded lg:rounded-md px-3 lg:px-4 py-1.5 lg:py-2 min-w-[50px] lg:min-w-[65px] shadow-inner">
                          <span className="text-2xl lg:text-3xl font-extrabold text-[#d4af37] tracking-widest drop-shadow-md leading-none">{timeLeft.mins}</span>
                          <span className="text-[7px] lg:text-[8px] text-white font-bold uppercase tracking-[0.2em] mt-1.5 lg:mt-2 opacity-90">Mins</span>
                        </div>
                        <span className="text-lg lg:text-xl text-white/20 font-light leading-none -mt-4 lg:-mt-5">|</span>
                        
                        <div className="flex flex-col items-center leading-none border border-[#d4af37]/40 bg-black/40 rounded lg:rounded-md px-3 lg:px-4 py-1.5 lg:py-2 min-w-[50px] lg:min-w-[65px] shadow-inner">
                          <span className="text-2xl lg:text-3xl font-extrabold text-[#d4af37] tracking-widest drop-shadow-md leading-none">{timeLeft.secs}</span>
                          <span className="text-[7px] lg:text-[8px] text-white font-bold uppercase tracking-[0.2em] mt-1.5 lg:mt-2 opacity-90">Secs</span>
                        </div>
                      </div>
                    )}
                 </div>
              </div>
            </div>

            {/* Desktop Prize Pool Area */}
            <div className="flex flex-col shrink-0">
              <div 
                className="bg-gradient-to-b from-[#FFF2B2] via-[#D4AF37] to-[#8C6600] p-[2px] shadow-2xl relative"
                style={{ clipPath: chamferedClipPath }}
              >
                 <div 
                   className="bg-gradient-to-br from-[#0c1b33] to-[#040810] flex items-center justify-center px-4 lg:px-5 py-2 lg:py-3 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] h-[65px] lg:h-[76px]"
                   style={{ clipPath: chamferedClipPath }}
                 >
                    <Trophy className="text-[#E4C567] mr-3 shrink-0 drop-shadow-[0_0_5px_rgba(212,175,55,0.8)] w-6 h-6 lg:w-8 lg:h-8" />
                    <div className="flex flex-col justify-center">
                      <span className="text-[8px] lg:text-[10px] text-[#A6C0DE] font-bold uppercase tracking-widest leading-none mb-1">Audition Prize Pool:</span>
                      <span className="text-sm lg:text-xl font-black text-[#FFF4D2] tracking-widest leading-none drop-shadow-md">UP TO GHC {settings.prize_pool_ghc || '1,000,000+'}</span>
                      <span className="text-[6px] lg:text-[7px] text-white/50 tracking-wider mt-1">Click to View Details</span>
                    </div>
                 </div>
              </div>
            </div>

            {/* Desktop Action Button */}
            <div className="shrink-0 flex items-center">
              <Link 
                href="/register" 
                className="bg-[#050B14] border border-[#d4af37]/30 text-[#A6C0DE] hover:text-white text-xs font-semibold tracking-wide px-5 lg:px-6 h-[55px] lg:h-[60px] flex items-center mt-auto justify-center rounded-full hover:bg-[#0c1b33] transition-colors shadow-[0_4px_10px_rgba(0,0,0,0.4)] whitespace-nowrap block"
              >
                Register Now
              </Link>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
