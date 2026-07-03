'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';
import { 
  Trophy, 
  Crown, 
  Star, 
  ArrowLeft, 
  ShieldAlert, 
  ArrowRight, 
  Copy, 
  Check, 
  X,
  Maximize2,
  Lock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { getApprovedParticipantMediaAction } from '@/features/participants/actions';

export default function ParticipantProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { participants, settings, syncParticipants } = useAppStore();
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [approvedMedia, setApprovedMedia] = useState<any[]>([]);

  // Voting interactive states
  const [isVoting, setIsVoting] = useState(false);
  const [voteAmount, setVoteAmount] = useState(10);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [valError, setValError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Lightbox view states
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    // Sync participants store if not cached
    if (participants.length === 0) {
      syncParticipants().catch(console.error);
    }
  }, [participants.length, syncParticipants]);

  // Find targeted contestant
  const participant = participants.find(p => p.id === id);

  // Load approved addition gallery photographs/videos
  useEffect(() => {
    if (id) {
      setLoadingMedia(true);
      getApprovedParticipantMediaAction(id)
        .then((media) => {
          setApprovedMedia(media || []);
        })
        .catch((err) => {
          console.error('[ProfilePage] Failed load media:', err);
        })
        .finally(() => {
          setLoadingMedia(false);
        });
    }
  }, [id]);

  // Handle vote URL copy/share
  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!participant) {
    return (
      <div className="bg-bg min-h-screen pt-40 pb-20 px-6 flex flex-col justify-center items-center text-center animate-in fade-in duration-500">
        <div className="bg-black/40 border border-white/5 rounded-[2.5rem] p-12 max-w-lg shadow-2xl relative overflow-hidden backdrop-blur">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#d4af37]" />
          <ShieldAlert className="text-[#d4af37] mx-auto mb-6" size={48} />
          <h1 className="text-2xl font-black text-white uppercase tracking-wider mb-2">CONTESTANT NOT FOUND</h1>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            The contestant profile you are looking for does not exist or has been removed from our databases.
          </p>
          <Link 
            href="/contestants" 
            className="inline-flex items-center gap-2 bg-[#d4af37] text-black font-black uppercase text-xs px-6 py-3.5 rounded-xl hover:bg-white transition-colors"
          >
            <ArrowLeft size={14} /> Back to Contestants
          </Link>
        </div>
      </div>
    );
  }

  // Double down on security: PARTICIPANT VISIBILITY RULES enforcement
  // Public profiles can show either qualified or evicted contestants, but never rejected or unqualified
  const isQualifiedOrEvicted = participant.status === 'qualified' || participant.status === 'evicted';
  if (!isQualifiedOrEvicted) {
    return (
      <div className="bg-bg min-h-screen pt-40 pb-20 px-6 flex flex-col justify-center items-center text-center animate-in fade-in duration-500">
        <div className="bg-black/60 border border-[#ea580c]/30 rounded-[2.5rem] p-12 max-w-lg shadow-2xl relative overflow-hidden backdrop-blur">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#ea580c]" />
          <Lock className="text-[#ea580c] mx-auto mb-6" size={48} />
          <h1 className="text-2xl font-black text-white uppercase tracking-wider mb-2">PROFILE CLASSIFIED / RESTRICTED</h1>
          <p className="text-[#f97316] text-[10px] uppercase font-bold tracking-widest font-mono mb-4 block">
            System Rules Restrict Public Exposes
          </p>
          <p className="text-gray-400 text-xs leading-relaxed mb-8 border-t border-white/5 pt-4">
            Under official Participant Visibility Rules, public detail pages never expose rejected, or unqualified entries. This profile is restricted from public viewing.
          </p>
          <Link 
            href="/contestants" 
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/25 text-white font-bold uppercase text-xs px-6 py-3.5 rounded-xl transition-all border border-white/10"
          >
            <ArrowLeft size={14} /> Back to Live Hierarchy
          </Link>
        </div>
      </div>
    );
  }

  // Combine profile photos + additional approved photos
  const staticImages = participant.media_urls?.images || [];
  const galleryItems = [
    ...staticImages.map((imgUrl, i) => ({
      id: `static-${i}`,
      url: imgUrl,
      media_type: 'image' as const
    })),
    ...approvedMedia.map(m => ({
      id: m.id,
      url: m.url,
      media_type: m.media_type as 'image' | 'video'
    }))
  ];

  const handleVoteSubmit = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setValError('An email is required to process and dispatch your payment receipt.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setValError('Please provide a valid email format.');
      return;
    }

    setValError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmedEmail,
          participantId: participant.id,
          voteCount: voteAmount
        })
      });

      const data = await response.json();

      if (response.ok && data.success && data.authorization_url) {
        // Redirect caller straight to Paystack checkout wrapper
        router.push(data.authorization_url);
      } else {
        setValError(data.message || 'Error occurred initializing billing gateway.');
      }
    } catch (err: any) {
      setValError('Could not establish secure gateway connection. Please check your network and repeat.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine ranking layout accents
  const rank = participant.ranking;
  const isRanked = rank && rank >= 1 && rank <= 3;

  // Render any videos uploaded
  const pitchVideos = (participant.media_urls?.videos || []).filter(v => !!v);

  return (
    <div className="bg-bg min-h-screen pt-36 md:pt-44 pb-20 animate-in fade-in duration-500 relative">
      {/* Dynamic Golden Ambient Accents */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#d4af37]/5 rounded-full blur-[200px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-[#a67c00]/5 rounded-full blur-[180px] pointer-events-none"></div>

      <div className="max-w-[1240px] mx-auto px-6 relative z-10 space-y-12">
        
        {/* Back Link Row */}
        <div>
          <Link 
            href="/contestants" 
            className="inline-flex items-center gap-2 text-[#A3A3A3] hover:text-[#d4af37] text-xs font-bold uppercase tracking-widest transition-colors group"
          >
            <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
            Back to Active Contestants
          </Link>
        </div>

        {/* PROFILE HEADER / CARD ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          
          {/* LEFT: Massive profile picture with styling ribbons */}
          <div className="lg:col-span-5 aspect-[4/5] sm:aspect-[4/5] relative rounded-[2rem] overflow-hidden border border-white/5 bg-[#0a0a0a]/80 shadow-[0_20px_50px_rgba(0,0,0,0.7)] group">
            
            {/* Evicted ribbon */}
            {participant.status === 'evicted' && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#ef4444] text-white font-black text-2xl sm:text-4xl uppercase tracking-[0.25em] px-10 py-4 -rotate-12 outline outline-2 sm:outline-4 outline-[#ef4444] outline-offset-2 sm:outline-offset-4 z-30 shadow-2xl whitespace-nowrap overflow-hidden text-center">
                EVICTED
              </div>
            )}

            {/* Rank ribbons */}
            {isRanked ? (
              <div className={`absolute top-6 left-6 z-20 flex items-center gap-1.5 px-5 py-2.5 rounded-2xl shadow-xl font-black text-xs uppercase tracking-widest text-black ${
                rank === 1 ? 'bg-gradient-to-r from-amber-400 to-[#d4af37]' :
                rank === 2 ? 'bg-gradient-to-r from-zinc-300 to-zinc-400' :
                'bg-gradient-to-r from-[#A67C00] to-amber-700 text-white'
              }`}>
                {rank === 1 ? <Crown size={14} className="fill-current" /> : <Star size={14} className="fill-current" />}
                {rank === 1 ? '1st Place' : rank === 2 ? '2nd Place' : '3rd Place'}
              </div>
            ) : (
              <div className="absolute top-6 left-6 z-20 bg-black/80 border border-white/10 text-[#d4af37] font-mono text-[9px] uppercase font-black tracking-widest px-4 py-2 rounded-xl">
                {participant.status === 'evicted' ? 'Evicted Participant' : 'Qualified Contestant'}
              </div>
            )}

            <img 
              src={staticImages[0] || 'https://images.unsplash.com/photo-1543807535-ecefc092c2da?q=80&w=1000&auto=format&fit=crop'} 
              alt={participant.full_name} 
              className={`w-full h-full object-cover group-hover:scale-102 transition-transform duration-700 ${participant.status === 'evicted' ? 'opacity-50 grayscale' : ''}`}
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent pt-32 flex flex-col justify-end p-8">
              <span className="text-[#d4af37] font-mono text-[10px] uppercase font-black tracking-widest block mb-1">
                DESIGNATION CODENAME
              </span>
              <p className="text-white font-extrabold text-2xl uppercase tracking-wider font-serif italic">
                "{participant.nickname}"
              </p>
            </div>
          </div>

          {/* RIGHT: Biography, details, stats, voting portal */}
          <div className="lg:col-span-7 flex flex-col space-y-8">
            
            {/* Headline Block */}
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 items-center justify-between">
                <span className="text-[#d4af37] font-mono text-xs uppercase tracking-[0.3em] font-black block">
                  CONTESTANT PROFILE PORTFOLIO
                </span>
                
                {/* Share copying tool */}
                <button 
                  onClick={handleCopyLink} 
                  className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 text-white text-[10px] font-bold uppercase tracking-widest py-2 px-4 rounded-xl flex items-center gap-1.5 transition-all"
                  title="Copy share link"
                >
                  {copied ? (
                    <>
                      <Check size={12} className="text-emerald-400" /> Link Copied
                    </>
                  ) : (
                    <>
                      <Copy size={12} /> Share Profile
                    </>
                  )}
                </button>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight leading-none">
                {participant.full_name}
              </h1>
              <p className="text-[#a3a3a3] text-lg sm:text-xl font-serif italic mb-2">
                "{participant.nickname}"
              </p>
            </div>

            {/* Metric Overview Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0c0c0c]/80 border border-[#212121] p-5 sm:p-6 rounded-2xl shadow-xl">
                <span className="text-gray-400 text-[10px] uppercase tracking-widest font-black block mb-2 font-mono">
                  Real-time Votes Accrued
                </span>
                <span className="text-3xl font-black text-white tracking-tight">
                  {participant.vote_count.toLocaleString()}
                </span>
              </div>
              <div className="bg-[#0c0c0c]/80 border border-[#212121] p-5 sm:p-6 rounded-2xl shadow-xl">
                <span className="text-gray-400 text-[10px] uppercase tracking-widest font-black block mb-2 font-mono">
                  Official Rank Tally
                </span>
                <span className="text-3xl font-black text-[#d4af37] tracking-tight">
                  {participant.ranking ? `#${participant.ranking}` : 'Unranked'}
                </span>
              </div>
            </div>

            {/* Biography & Dynamic Metadatas */}
            <div className="space-y-4">
              <h3 className="text-white font-extrabold uppercase text-xs tracking-widest border-b border-white/[0.08] pb-2 font-mono">
                BIOGRAPHY & SCALE TARGET
              </h3>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-light first-letter:text-3xl first-letter:font-black first-letter:text-[#d4af37] first-letter:mr-2">
                {participant.bio || 'Detailed bio not registered.'}
              </p>

              {/* Dynamic Metadata Block */}
              {participant.metadata && Object.keys(participant.metadata).length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 bg-black/40 border border-white/5 p-6 rounded-2xl">
                  {Object.entries(participant.metadata).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <span className="text-gray-400 text-[9px] uppercase tracking-widest font-black font-mono block">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="text-white text-xs sm:text-sm font-bold block">
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* MONETIZED PAYSTACK POWER VOTING COMPONENT */}
            <div className="border border-[#262626] rounded-3xl p-1 bg-black/50 overflow-hidden shadow-2xl">
              {participant.status === 'evicted' ? (
                <div className="p-6 bg-[#0c0c0c] border border-red-500/20 rounded-[1.4rem] text-center space-y-4">
                  <div className="inline-flex px-4 py-1.5 bg-red-500/10 text-red-500 text-[10px] font-mono tracking-widest font-black uppercase rounded-full">
                    ● VOTING LOCKED
                  </div>
                  <h4 className="text-white text-md font-bold uppercase">Candidate Evicted</h4>
                  <p className="text-zinc-500 text-xs leading-relaxed max-w-xs mx-auto">
                    This participant has been evicted from the show. Voting is permanently disabled.
                  </p>
                </div>
              ) : isVoting ? (
                <div className="p-6 bg-[#0c0c0c] border border-white/[0.03] rounded-[1.4rem] space-y-5 animate-in slide-in-from-bottom duration-300">
                  <header>
                    <span className="text-[#d4af37] font-mono text-[10px] uppercase font-black tracking-widest block mb-1">
                      SECURE BILLING MODULE
                    </span>
                    <h4 className="text-white text-md font-bold uppercase">Cast Power-Votes</h4>
                  </header>

                  {/* Quantity selector blocks */}
                  <div className="grid grid-cols-4 gap-2">
                    {[10, 50, 100, 500].map(v => (
                      <button 
                        key={v} 
                        disabled={isSubmitting}
                        onClick={() => { setVoteAmount(v); setValError(null); }} 
                        className={`py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 disabled:opacity-40 cursor-pointer ${
                          voteAmount === v 
                            ? 'bg-gradient-to-r from-[#d4af37] to-[#f2a900] text-black shadow-lg font-black' 
                            : 'bg-white/5 text-[#A3A3A3] border border-[#212121] hover:text-white hover:border-[#d4af37]/30'
                        }`}
                      >
                        {v} Votes
                      </button>
                    ))}
                  </div>

                  {/* Dynamic slider or input */}
                  <div className="bg-black/80 border border-[#212121] rounded-2xl p-4 flex justify-between items-center">
                    <span className="text-[#A3A3A3] text-xs font-bold uppercase font-mono">Custom Votes Count</span>
                    <input 
                      type="number"
                      min={1}
                      max={10000}
                      value={voteAmount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setVoteAmount(isNaN(val) ? 0 : Math.max(1, val));
                        setValError(null);
                      }}
                      className="bg-transparent border-0 text-[#d4af37] font-black text-right text-lg outline-none w-28 pr-1"
                    />
                  </div>

                  {/* Email address */}
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pl-1 font-mono">
                      Supporter Email
                    </label>
                    <input 
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setValError(null); }}
                      placeholder="e.g. supporter@gmail.com"
                      className="w-full bg-black/80 border border-[#212121] rounded-xl px-4 py-3 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-[#d4af37] transition-all"
                    />
                  </div>

                  {/* Validation feedback alerts */}
                  {valError && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] p-3 rounded-xl uppercase tracking-wider font-semibold">
                      ⚠ {valError}
                    </div>
                  )}

                  {/* Trigger button */}
                  <button 
                    onClick={handleVoteSubmit} 
                    disabled={isSubmitting || !settings.voting_enabled || voteAmount <= 0}
                    className="w-full bg-gradient-to-r from-[#d4af37] to-[#f2a900] text-black font-black uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity text-xs cursor-pointer shadow-lg shadow-[#d4af37]/10 disabled:opacity-40"
                  >
                    {isSubmitting ? (
                      'Routing Secure Portal...'
                    ) : (
                      <>
                        Initialize GHC {(voteAmount * (settings.vote_price || 5.0)).toFixed(2)} checkout <ArrowRight size={14} className="stroke-[2.5px]" />
                      </>
                    )}
                  </button>

                  <button 
                    onClick={() => !isSubmitting && setIsVoting(false)}
                    disabled={isSubmitting}
                    className="w-full text-center text-zinc-500 hover:text-white transition-colors text-[10px] uppercase font-black font-mono tracking-widest"
                  >
                    Cancel Selection
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    if (!settings.voting_enabled) {
                      alert('Voting is currently terminated by the Administrator.');
                      return;
                    }
                    setIsVoting(true);
                  }}
                  disabled={!settings.voting_enabled}
                  className="w-full bg-gradient-to-r from-[#d4af37] to-[#f2a900] disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 text-black font-black uppercase tracking-widest py-5 rounded-[1.4rem] hover:opacity-95 transition-all flex justify-center items-center gap-3 shadow-xl cursor-pointer"
                >
                  <Trophy size={18} className="stroke-[2.5px]" /> 
                  {settings.voting_enabled ? 'Cast Power Votes Now' : 'Voting Closed'}
                </button>
              )}
            </div>

          </div>
        </div>

        {/* CONTROLLER MULTI-MEDIA GALLERIES */}
        <div className="space-y-10 pt-10 border-t border-white/[0.05]">
          
          {/* Header */}
          <div className="flex items-center gap-4">
            <h2 className="text-white font-extrabold uppercase text-sm tracking-widest font-mono">
              PORTFOLIO SHOWCASE GALLERY
            </h2>
            <div className="h-px bg-white/5 flex-1" />
          </div>

          {loadingMedia ? (
            <div className="py-20 text-center text-gray-500 text-xs font-bold uppercase tracking-widest animate-pulse font-mono">
              Fetching dynamic portfolio captures...
            </div>
          ) : galleryItems.length === 0 ? (
            <div className="border border-dashed border-white/5 rounded-2xl py-16 text-center text-gray-500 font-mono text-xs">
              📂 No authorized showcasing photos loaded.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {galleryItems.map((media, idx) => (
                <div 
                  key={media.id}
                  onClick={() => setLightboxIndex(idx)}
                  className="bg-[#0a0a0a] aspect-square rounded-2xl overflow-hidden border border-white/5 cursor-pointer hover:border-[#d4af37]/50 transition-all relative group"
                >
                  <img 
                    src={media.url} 
                    alt={`${participant.full_name} showcase ${idx}`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 size={20} className="text-white hover:text-[#d4af37] transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* VIDEOS BROADCAST BROAD BAND */}
        {pitchVideos.length > 0 && (
          <div className="space-y-8 pt-6">
            <div className="flex items-center gap-4">
              <h2 className="text-white font-extrabold uppercase text-sm tracking-widest font-mono">
                COMPETITION STAND BROADCASTS
              </h2>
              <div className="h-px bg-white/5 flex-1" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {pitchVideos.map((videoUrl, idx) => {
                const isYoutube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') || videoUrl.includes('/embed/');
                
                return (
                  <div 
                    key={idx} 
                    className="bg-black border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl aspect-video w-full relative"
                  >
                    {isYoutube ? (
                      <iframe 
                        className="w-full h-full"
                        src={videoUrl.replace('watch?v=', 'embed/')} 
                        title={`${participant.full_name} audition stream`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                      />
                    ) : (
                      <video 
                        src={videoUrl} 
                        controls
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* PICTURE LIGHTBOX MODAL CONTAINER */}
      {lightboxIndex !== null && galleryItems[lightboxIndex] && (
        <div 
          className="fixed inset-0 z-[100050] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close button */}
          <button 
            onClick={() => setLightboxIndex(null)}
            className="absolute top-6 right-6 w-12 h-12 rounded-full border border-white/10 bg-[#0a0a0a]/90 text-white hover:text-black hover:bg-[#d4af37] transition-all flex items-center justify-center transform active:scale-95 cursor-pointer z-[100060]"
          >
            <X size={18} />
          </button>

          {/* Picture container */}
          <div className="max-w-4xl max-h-[75vh] w-full px-6 relative flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img 
              src={galleryItems[lightboxIndex].url} 
              alt="Active Lightbox Portfolio" 
              className="max-h-[75vh] max-w-full object-contain rounded-2xl border border-white/5"
            />

            {/* Navigation buttons */}
            {galleryItems.length > 1 && (
              <>
                <button 
                  onClick={() => setLightboxIndex((lightboxIndex - 1 + galleryItems.length) % galleryItems.length)}
                  className="absolute -left-4 sm:left-4 w-10 h-10 rounded-full bg-black/80 hover:bg-[#d4af37] text-white hover:text-black border border-white/10 flex items-center justify-center transition-all cursor-pointer"
                >
                  <ChevronLeft size={18} />
                </button>
                <button 
                  onClick={() => setLightboxIndex((lightboxIndex + 1) % galleryItems.length)}
                  className="absolute -right-4 sm:right-4 w-10 h-10 rounded-full bg-black/80 hover:bg-[#d4af37] text-white hover:text-black border border-white/10 flex items-center justify-center transition-all cursor-pointer"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>

          <div className="mt-4 text-center">
            <span className="text-[#d4af37] font-mono text-[10px] uppercase font-black tracking-widest block mb-1">
              PORTFOLIO FILE ATTACHMENT
            </span>
            <p className="text-zinc-400 text-xs">
              {lightboxIndex + 1} of {galleryItems.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
