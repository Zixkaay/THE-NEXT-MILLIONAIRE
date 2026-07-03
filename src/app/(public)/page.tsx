'use client';

import { motion } from 'framer-motion';

import { ASSETS } from '@/data/assets';
import { useAppStore } from '@/store/useAppStore';
import { ChevronDown, CheckCircle2, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RegistrationForm } from '@/components/RegistrationForm';
import { VotingWidget } from '@/components/VotingWidget';
import { useState, useEffect } from 'react';
import { ParticipantModal } from '@/components/ParticipantModal';
import { DatabaseParticipant, DatabaseAnnouncement } from '@/types/database';
import { AnnouncementModal } from '@/components/AnnouncementModal';
import { Megaphone } from 'lucide-react';

// Custom hexagon patterned background style helper
const hexPatternStyles = {
  backgroundColor: '#fbf8f1',
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='103.92' viewBox='0 0 60 103.92' xmlns='http://www.w3.org/2000/svg'%3E%3Cg stroke='%23d4af37' stroke-width='1' stroke-opacity='0.15' fill='none'%3E%3Cpath d='M30 103.92V51.96M0 51.96l30 -17.32l30 17.32M0 51.96l30 17.32l30 -17.32M0 0l30 17.32l30 -17.32M30 17.32V51.96'/%3E%3C/g%3E%3C/svg%3E")`,
};

function FormOrSpotlightSwitch() {
  const { settings } = useAppStore();

  // Logic 1: Voting Enabled -> Show Voting Widget
  if (settings.voting_enabled) {
    return <VotingWidget />;
  }

  // Logic 2: Remove Registration Form (Promotional Advertising Board state)
  if (settings.remove_registration_form) {
    const isImageAvailable = !!settings.advertising_image_url;
    
    return (
      <div className="w-full max-w-md bg-[#0a0a0a] border border-[#262626] rounded-[2.5rem] p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#d4af37]/10 to-transparent blur-2xl opacity-70" />
        
        <header className="mb-4">
          <span className="inline-flex px-3 py-1 bg-[#d4af37]/10 text-[#d4af37] text-[10px] font-mono tracking-widest font-black uppercase rounded-full mb-3">
            📢 FEATURED ADVERTISEMENT
          </span>
          <h2 className="text-white text-xl md:text-2xl font-black uppercase tracking-tight line-clamp-2">
            {settings.advertising_title || 'Global Pitch Competition'}
          </h2>
        </header>

        {isImageAvailable && (
          <div className="aspect-[16/10] w-full rounded-2xl overflow-hidden border border-white/5 relative bg-black/20 mb-4 group-hover:border-[#d4af37]/30 transition-colors">
            <img 
              src={settings.advertising_image_url} 
              alt={settings.advertising_title || 'Event Flyer'} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        )}

        <p className="text-[#A3A3A3] text-xs leading-relaxed mb-6 font-light">
          {settings.advertising_text || 'Join with our global high-net-worth mentors to accelerate the next business titan.'}
        </p>

        <a 
          href={settings.advertising_link_url || '/about'}
          target={settings.advertising_link_url?.startsWith('http') ? '_blank' : undefined}
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#ffc107] to-[#F2A900] text-black font-extrabold text-xs uppercase tracking-widest py-3.5 px-6 rounded-xl hover:opacity-90 transition-opacity font-mono"
        >
          Explore Pathway &rarr;
        </a>
      </div>
    );
  }

  // Logic 3: Voting Disabled + Registration Open => Registration Form Component
  if (settings.registration_open) {
    return (
      <div className="w-full max-w-md rounded-[2rem] p-6 sm:p-8 shadow-2xl relative bg-gradient-to-b from-[#F8F1E1] to-[#EFE4CE] overflow-hidden">
        {/* Top-Left Geometric Cube Pattern */}
        <div 
          className="absolute top-0 left-0 w-64 h-72 opacity-100 pointer-events-none" 
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='103.92' viewBox='0 0 60 103.92' xmlns='http://www.w3.org/2000/svg'%3E%3Cg stroke='%23111111' stroke-width='1.5' stroke-opacity='0.85' fill='none'%3E%3Cpath d='M30 103.92V51.96M0 51.96l30 -17.32l30 17.32M0 51.96l30 17.32l30 -17.32M0 0l30 17.32l30 -17.32M30 17.32V51.96'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 103.92px',
            maskImage: 'linear-gradient(135deg, black 20%, transparent 60%)',
            WebkitMaskImage: 'linear-gradient(135deg, black 20%, transparent 60%)'
          }}
        />

        {/* Bottom-Right Geometric Cube Pattern */}
        <div 
          className="absolute bottom-0 right-0 w-64 h-72 opacity-100 pointer-events-none" 
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='103.92' viewBox='0 0 60 103.92' xmlns='http://www.w3.org/2000/svg'%3E%3Cg stroke='%23111111' stroke-width='1.5' stroke-opacity='0.85' fill='none'%3E%3Cpath d='M30 103.92V51.96M0 51.96l30 -17.32l30 17.32M0 51.96l30 17.32l30 -17.32M0 0l30 17.32l30 -17.32M30 17.32V51.96'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 103.92px',
            maskImage: 'linear-gradient(315deg, black 20%, transparent 70%)',
            WebkitMaskImage: 'linear-gradient(315deg, black 20%, transparent 70%)'
          }}
        />

        {/* Bottom-Left Botanical Element Overlay (Abstract SVGs of dried leaves) */}
        <div className="absolute bottom-0 left-0 w-32 h-40 pointer-events-none opacity-50">
           <svg viewBox="0 0 100 100" className="w-full h-full text-[#A67C00] fill-current drop-shadow-md">
             <path d="M0,100 Q10,70 30,50 Q15,80 0,100 Z" />
             <path d="M0,100 Q30,60 50,30 Q25,75 0,100 Z" opacity="0.8" />
             <path d="M10,100 Q40,90 70,60 Q35,85 10,100 Z" opacity="0.6" />
           </svg>
        </div>

        <div className="text-center mb-6 md:mb-8 pb-4 relative z-10 border-b-2 border-dashed border-[#d4af37]/30">
          <div className="absolute inset-0 bg-[#F8F1E1] blur-2xl -z-10 scale-[1.3] opacity-90 rounded-full" />
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a1a] mb-2 uppercase tracking-tight relative z-10">Official Audition</h2>
          <p className="text-[#1a1a1a]/60 font-medium uppercase tracking-widest text-[10px] md:text-xs relative z-10">Submit Your Application</p>
        </div>
        <div className="relative z-10">
          <RegistrationForm />
        </div>
      </div>
    );
  }

  // Logic 4: Fallback Closed
  return (
    <div className="w-full max-w-md bg-[#0a0a0a] border border-[#262626] rounded-[2.5rem] p-8 text-center shadow-xl">
       <CheckCircle2 className="text-[#A3A3A3] w-16 h-16 mx-auto mb-4 opacity-50" />
       <h2 className="text-white text-2xl font-black uppercase mb-2">Registration Closed</h2>
       <p className="text-[#A3A3A3] text-sm leading-relaxed">The application window for this phase has officially closed. Please check back later.</p>
    </div>
  );
}


export default function Page() {
  const { settings, syncParticipants, participants, announcements, sponsors } = useAppStore();
  const router = useRouter();
  const [selectedParticipant, setSelectedParticipant] = useState<DatabaseParticipant | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<DatabaseAnnouncement | null>(null);

  useEffect(() => {
    syncParticipants().catch(console.error);
  }, [syncParticipants]);

  return (
    <div className="bg-bg min-h-screen animate-in fade-in duration-500 relative">
      
      {/* Intricate Hero Section matching the image */}
      <section 
        className="relative w-full pb-0 lg:pb-4 flex flex-col bg-[#050B14] z-10"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(5, 11, 20, 0.4), rgba(5, 11, 20, 0.4)), url('${ASSETS.heroBackground}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Fixed physical empty space spacer. 
            Prevents flex collapse. 160-240px clears the absolute header completely.
            10-15vh provides the requested 1/7 empty background space below it before content starts. */}
        <div className="w-full shrink-0 h-[calc(180px+12vh)] lg:h-[calc(220px+15vh)]"></div>

        <div className="w-full max-w-[1500px] mx-auto px-4 md:px-8 pb-4 lg:pb-6 flex flex-col lg:flex-row gap-12 lg:gap-16 items-end lg:items-start relative z-10">
          
          {/* Left Text Block */}
          <div className="text-left flex flex-col items-start lg:flex-1 w-full min-w-0">
            
            {/* MOBILE & TABLET ONLY: Transplanted Prize Pool Box replacing the text string */}
            <div className="w-full flex lg:hidden justify-start mb-6">
              <div 
                className="bg-gradient-to-b from-[#ffc107] to-[#F2A900] p-[2px] shadow-[0_15px_30px_rgba(0,0,0,0.8)] relative w-full sm:w-auto"
                style={{ clipPath: "polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)" }}
              >
                 <div 
                   className="bg-gradient-to-br from-[#0c1b33] to-[#040810] flex items-center justify-start px-4 sm:px-6 py-3 shadow-[inset_0_0_30px_rgba(0,0,0,0.9)] w-full sm:w-auto"
                   style={{ clipPath: "polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)" }}
                 >
                   <div className="flex flex-col justify-center text-left">
                     <span className="text-[10px] sm:text-xs text-[#A6C0DE] font-bold uppercase tracking-[0.3em] leading-none mb-1">Audition Prize Pool</span>
                     <span className="text-xl sm:text-2xl font-black text-[#ffc107] tracking-widest leading-none drop-shadow-md">UP TO GHC {settings.prize_pool_ghc || '1,000,000+'}</span>
                     <span className="text-[7px] sm:text-[9px] text-white/50 tracking-widest mt-1 uppercase">Official Phase 1 Reward</span>
                   </div>
                 </div>
              </div>
            </div>

            {/* DESKTOP ONLY: Original text */}
            <div className="hidden lg:flex flex-col items-start w-full">
              <p className="text-[#ffc107] font-serif italic text-xl md:text-2xl mb-4 flex items-center justify-start gap-2">
                <span className="text-lg md:text-xl">★</span> CONTEST PRIZE: <span className="text-lg md:text-xl">★</span>
              </p>
              <h2 className="text-[#ffc107] text-4xl md:text-5xl lg:text-7xl font-bold tracking-wider mb-8 drop-shadow-lg text-left break-all">
                GHC {parseInt(settings.prize_pool_ghc.replace(/[^0-9]/g, '') || '0').toLocaleString()}+
              </h2>
            </div>
            
            {/* The Specific Text update as requested by prompt */}
            <h1 className="font-serif leading-[1.1] mb-6 drop-shadow-2xl flex flex-col items-start w-full">
              <span className="text-white text-4xl sm:text-5xl md:text-6xl tracking-widest mt-2 font-light">THE</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ffc107] via-[#F2A900] to-[#ffc107] text-[11vw] sm:text-[clamp(3.5rem,7vw,5rem)] lg:text-[clamp(2.5rem,4vw,4.5rem)] xl:text-[clamp(4.5rem,5vw,6rem)] 2xl:text-[6.5rem] font-black uppercase tracking-tighter md:tracking-tight py-2 leading-none w-full text-left drop-shadow-sm break-words">
                BILLIONAIRE'S
              </span>
              <span className="text-white text-4xl sm:text-5xl md:text-6xl tracking-widest mt-2 font-light">PATH</span>
            </h1>

            <p className="text-white/80 text-sm sm:text-base md:text-lg tracking-widest uppercase font-medium mb-10 text-left">
              No ShortCuts, No Excuses, No Second Chance
            </p>
            
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 mt-2 w-full max-w-[600px] lg:max-w-none justify-start">
              <Link href="/about" className="bg-white text-black font-bold text-xs md:text-sm tracking-widest uppercase px-6 lg:px-8 py-4 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:bg-gray-200 transition-colors text-center shrink-0 flex-1 sm:flex-none">
                About the Show
              </Link>
              <Link href="/about" className="bg-gradient-to-r from-[#ffc107] to-[#F2A900] text-black font-bold text-xs md:text-sm tracking-widest uppercase px-6 lg:px-8 py-4 rounded-full shadow-[0_0_15px_rgba(255,193,7,0.5)] hover:opacity-90 transition-opacity text-center shrink-0 flex-1 sm:flex-none">
                Register for Auditions
              </Link>
            </div>
            
            <div className="mt-16 md:mt-24 w-full relative">
              <div className="absolute top-0 left-0 w-24 h-[1px] bg-[#d4af37]"></div>
              <h3 className="text-[#ffc107] text-4xl md:text-5xl lg:text-7xl font-serif italic tracking-widest leading-none">
                DREAM <span className="font-sans font-black not-italic text-white">BIG.</span>
              </h3>
              <p className="text-[#A3A3A3] text-xs md:text-sm mt-4 uppercase tracking-[0.5em] font-bold">The Journey is Just Beginning</p>
            </div>
          </div>
          
          {/* Trophy - Responsively positioned on all screens sitting on the edge of the hero/sponsor transition */}
          <motion.img 
            src={ASSETS.trophy} 
            alt="Bironic Trophy"
            animate={{
              y: [0, -12, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute left-[54%] xl:left-[55%] -translate-x-1/2 bottom-[-15px] sm:bottom-[-20px] md:bottom-[-25px] h-[160px] sm:h-[220px] md:h-[260px] lg:h-[280px] xl:h-[320px] w-auto object-contain z-50 drop-shadow-[0_20px_60px_rgba(0,0,0,0.9)] transition-all duration-700 pointer-events-none transform hover:scale-110"
            referrerPolicy="no-referrer"
          />

          {/* Right Form Block - Form only */}
          <div className="relative flex justify-end w-full lg:w-auto shrink-0 px-2 sm:px-0 mt-8 lg:mt-0">
            <div className="shrink-0 w-full sm:w-auto max-w-[450px] relative z-10">
              <FormOrSpotlightSwitch />
            </div>
          </div>
          
        </div>
      </section>

      {/* Sponsors Section (Responsive offset box overlapping Hero) */}
      <section className="relative w-full z-20 px-0 -mt-8 md:-mt-16 lg:-mt-24 mb-12 md:mb-16">
        
        {/* Faded Background blending smoothly upward into the hero section */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/50 to-transparent -z-10 pointer-events-none"></div>

        <div className="w-full pt-2 lg:pt-4 pb-0">
          <div className="flex items-center justify-start px-0 mb-2 lg:mb-3">
             <div className="bg-gradient-to-r from-white/90 via-white/60 to-transparent pl-4 md:pl-8 lg:pl-12 pr-12 py-1.5 md:py-2">
               <span className="text-[#d4af37] font-bold text-xs md:text-sm tracking-widest uppercase z-10 drop-shadow-sm">Our Official Partners</span>
             </div>
          </div>
          {(() => {
            const isMarquee = sponsors.length > 4;
            
            if (isMarquee) {
              return (
                <div className="w-full overflow-hidden py-2 px-2 md:px-4">
                  <motion.div 
                    className="flex gap-4 md:gap-6 flex-row w-max"
                    animate={{ x: [0, -400] }}
                    transition={{
                      repeat: Infinity,
                      ease: "linear",
                      duration: 18,
                    }}
                  >
                    {/* Repeat sponsors to ensure smooth continuous infinite scroll */}
                    {[...sponsors, ...sponsors, ...sponsors, ...sponsors].map((sponsor, idx) => (
                      <div key={`${sponsor.id}-${idx}`} className="bg-white border-2 border-[#d4af37] rounded-lg md:rounded-xl p-0 flex items-center justify-center shadow-sm w-[160px] sm:w-[200px] md:w-[240px] h-[85px] sm:h-[105px] md:h-[115px] shrink-0 transition-transform hover:-translate-y-1 overflow-hidden">
                        {sponsor.logo_type === 'text' && (
                          <span className="font-serif text-[#d4af37] text-xl md:text-2xl font-black">{sponsor.logo_content}</span>
                        )}
                        {sponsor.logo_type === 'image' && (
                          <img src={sponsor.logo_content} alt={sponsor.name} className="w-full h-full object-cover" />
                        )}
                        {sponsor.logo_type === 'icon' && (
                          <div className="w-10 h-10 flex items-center justify-center text-[#d4af37]">
                            {sponsor.logo_content === 'shield' ? (
                              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-[#d4af37]" />
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </motion.div>
                </div>
              );
            }

            return (
              <div className="flex flex-row flex-nowrap overflow-x-auto justify-start sm:justify-center items-center gap-4 md:gap-6 pb-4 px-4 md:px-8 lg:px-12 w-full mx-auto max-w-5xl no-scrollbar scroll-smooth">
                {sponsors.map(sponsor => (
                  <div key={sponsor.id} className="bg-white border-2 border-[#d4af37] rounded-lg md:rounded-xl p-0 flex items-center justify-center shadow-sm transition-transform hover:-translate-y-1 w-[160px] sm:w-[200px] md:w-[240px] h-[85px] sm:h-[105px] md:h-[115px] shrink-0 overflow-hidden">
                    {sponsor.logo_type === 'text' && (
                      <span className="font-serif text-[#d4af37] text-xl md:text-2xl font-black">{sponsor.logo_content}</span>
                    )}
                    {sponsor.logo_type === 'image' && (
                      <img src={sponsor.logo_content} alt={sponsor.name} className="w-full h-full object-cover" />
                    )}
                    {sponsor.logo_type === 'icon' && (
                      <div className="w-10 h-10 flex items-center justify-center text-[#d4af37]">
                        {sponsor.logo_content === 'shield' ? (
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#d4af37]" />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </section>

      {/* Section 3: Featured News - High End Editorial Layout */}
      {(() => {
        const blogPosts = useAppStore(s => s.blogPosts);
        
        // Branded editorial fallback post if there are no blog posts configured
        const fallbackPost = {
          id: 'welcome-announcement',
          title: "The Stage is Set: The Next Billionaire Season 1 Auditions Begin",
          content: "Welcome to the official portal of The Next Billionaire. We are searching for visionary minds, creators, and leaders of tomorrow. Register today, showcase your talent, connect with sponsors, and secure your chance to win life-changing prizes.",
          image_url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1200",
          is_featured: true,
          is_fallback: true
        };

        const featuredPost = blogPosts.find(p => p.is_featured) || blogPosts[0] || fallbackPost;
        
        const contentPreview = featuredPost.content.length > 300 
            ? featuredPost.content.substring(0, 300) + '...' 
            : featuredPost.content;

        return (
          <section className="w-full bg-[#0a0a0a] border-y border-[#262626] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-[#d4af37]/5 blur-[120px] pointer-events-none" />
            <div className="max-w-[1500px] mx-auto px-4 md:px-8 py-24">
              <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                <div className="w-full lg:w-1/2 relative group">
                  <div className="absolute -inset-4 bg-gradient-to-tr from-[#d4af37]/20 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="relative aspect-[16/10] overflow-hidden rounded-[2.5rem] border border-[#262626] shadow-2xl">
                    <img src={featuredPost.image_url} alt={featuredPost.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                    <div className="absolute top-8 left-8 bg-[#d4af37] text-black text-xs font-black uppercase px-4 py-2 rounded-full shadow-2xl">
                      {(featuredPost as any).is_fallback ? "Official Announcement" : "Editorial Choice"}
                    </div>
                  </div>
                </div>
                <div className="w-full lg:w-1/2 flex flex-col items-start text-left">
                   <p className="text-[#d4af37] font-bold text-sm tracking-[0.4em] uppercase mb-6 flex items-center gap-4">
                     <span className="w-12 h-[1px] bg-[#d4af37]"></span>
                     Official Update
                   </p>
                   <h3 className="text-4xl md:text-5xl xl:text-6xl font-serif text-white tracking-tight leading-[1.1] mb-8 drop-shadow-lg">
                     {featuredPost.title}
                   </h3>
                   <p className="text-[#A3A3A3] text-lg md:text-xl font-light leading-relaxed mb-10 max-w-2xl">
                     {contentPreview}
                   </p>
                   {(featuredPost as any).is_fallback ? (
                     <Link href="/about" className="group flex items-center gap-4 text-white hover:text-[#d4af37] transition-colors">
                       <span className="bg-[#1a1a1a] border border-[#262626] p-4 rounded-full group-hover:bg-[#d4af37] group-hover:text-black transition-all duration-300">
                         <ChevronDown className="-rotate-90" size={20} />
                       </span>
                       <span className="text-sm font-black uppercase tracking-widest">Learn More About the Competition</span>
                     </Link>
                   ) : (
                     <Link href={`/blog/${featuredPost.id}`} className="group flex items-center gap-4 text-white hover:text-[#d4af37] transition-colors">
                       <span className="bg-[#1a1a1a] border border-[#262626] p-4 rounded-full group-hover:bg-[#d4af37] group-hover:text-black transition-all duration-300">
                         <ChevronDown className="-rotate-90" size={20} />
                       </span>
                       <span className="text-sm font-black uppercase tracking-widest">Read the Full Story</span>
                     </Link>
                   )}
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* Section 4: Journey to Success (The Steps) */}
      <section className="w-full py-24 bg-[#050B14]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
           <div className="text-center mb-20">
             <h3 className="text-4xl md:text-6xl font-serif text-white tracking-widest uppercase mb-6">
               Road to <span className="text-[#d4af37]">Billionaire</span>
             </h3>
             <p className="text-[#A3A3A3] max-w-2xl mx-auto italic font-serif">A four-stage evolution from dreamer to industry titan. No shortcuts allowed.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
             {[
               { n: '01', title: 'Auditions', desc: 'Regional selection centers across Ghana and USA. Showcase your raw potential.' },
               { n: '02', title: 'Incubation', desc: 'Six weeks of intensive branding, financial literacy, and mental conditioning.' },
               { n: '03', title: 'Elimination', desc: 'The field narrows. Only the most disciplined and innovative remain standing.' },
               { n: '04', title: 'The Finale', desc: 'Glory, investment, and the path to your first billion begins here.' },
             ].map((step, idx) => (
               <div key={idx} className="group relative pt-12">
                 <span className="absolute top-0 left-0 text-7xl font-black text-white/5 group-hover:text-[#d4af37]/10 transition-colors duration-500 font-mono">{step.n}</span>
                 <div className="relative z-10">
                   <h4 className="text-[#d4af37] font-black uppercase tracking-[0.2em] mb-4 text-sm">{step.title}</h4>
                   <p className="text-[#A3A3A3] text-sm leading-relaxed border-l border-[#262626] group-hover:border-[#d4af37] pl-6 transition-colors duration-500">
                     {step.desc}
                   </p>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </section>

      {/* Section 4.5: Broadcast Bulletin Board (Announcements) */}
      {announcements.filter(a => a.is_published !== false).length > 0 && (
        <section className="w-full bg-gradient-to-b from-[#050B14] to-[#0a0f1d] border-t border-[#262626] py-24 relative overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-[#d4af37]/5 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="max-w-[1200px] mx-auto px-4 md:px-8">
            <div className="text-center mb-16">
              <span className="text-[#d4af37] text-[10px] uppercase font-black tracking-[0.3em] block mb-2">📢 Official Broadcasts</span>
              <h3 className="text-3xl md:text-5xl font-serif text-white tracking-widest uppercase mb-4">
                Billionaire <span className="text-[#d4af37]">Bulletin</span>
              </h3>
              <p className="text-[#A3A3A3] max-w-xl mx-auto italic font-serif text-sm">Critical live updates, audition coordinates, and official schedule adjustments straight from headquarters.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {announcements.filter(a => a.is_published !== false).map(ann => (
                <div 
                  key={ann.id}
                  onClick={() => setSelectedAnnouncement(ann)}
                  className="bg-[#0c1421]/60 border border-[#232b3a] rounded-[2.5rem] p-6 cursor-pointer hover:border-[#d4af37] transition-all duration-300 flex flex-col justify-between space-y-6 group relative shadow-2xl overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#d4af37]/5 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="space-y-4">
                    {ann.image_url ? (
                      <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden border border-white/5 relative bg-black/20">
                        <img 
                          src={ann.image_url} 
                          alt={ann.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                      </div>
                    ) : (
                      <div className="aspect-[16/9] w-full rounded-2xl bg-black/30 border border-white/5 flex flex-col items-center justify-center p-4">
                        <Megaphone size={30} className="text-[#d4af37] opacity-65 mb-1" />
                        <span className="text-[9px] text-[#A3A3A3] font-mono whitespace-nowrap font-bold">Broadcast Update</span>
                      </div>
                    )}

                    <div className="space-y-2">
                      <span className="text-[10px] text-[#A3A3A3] font-mono block">
                        {new Date(ann.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </span>
                      <h4 className="text-white font-extrabold uppercase text-sm tracking-wide leading-snug line-clamp-2 group-hover:text-[#d4af37] transition-all">
                        {ann.title}
                      </h4>
                      <p className="text-[#A3A3A3] text-xs leading-relaxed line-clamp-3 font-light">
                        {ann.content}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/[0.05] flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-[#d4af37] group-hover:translate-x-1.5 transition-transform duration-300">
                    <span>Read Details &rarr;</span>
                    {ann.video_url && (
                      <span className="bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[8px] font-black tracking-widest px-2 py-1 rounded">Video Attached</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section 5: Featured Contestants */}
      <section className="w-full bg-[#050B14] border-t border-[#262626] py-24">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
           <div className="flex flex-col md:flex-row justify-between items-center mb-12 text-center md:text-left">
             <div>
               <h3 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-2">
                 Featured <span className="text-[#d4af37]">Contestants</span>
               </h3>
               <p className="text-[#A3A3A3] font-serif italic">Previewing the top contenders.</p>
             </div>
             <Link href="/contestants" className="mt-6 md:mt-0 bg-transparent border border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition-colors rounded-full px-8 py-3 text-sm font-bold uppercase tracking-widest shrink-0">
               View All Contestants
             </Link>
           </div>
           
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
             {participants.filter(p => p.status === 'qualified').slice(0, 4).map(participant => (
               <div 
                 key={participant.id} 
                 onClick={() => router.push(`/contestants/${participant.id}`)}
                 className="bg-[#0a0a0a] border border-[#262626] rounded-2xl overflow-hidden group hover:border-[#d4af37] transition-all relative cursor-pointer flex flex-col justify-between"
               >
                 <div>
                   {participant.status === 'evicted' && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white text-[9px] font-black uppercase px-2 py-1 rounded z-10 shadow-lg">Eliminated</div>
                    )}
                    {participant.ranking === 1 && (
                     <div className="absolute top-2 left-2 bg-[#d4af37] text-black text-[9px] font-black uppercase px-2 py-1 rounded z-10 shadow-lg">1st Place</div>
                   )}
                   <div className="aspect-[4/5] overflow-hidden">
                     <img src={participant.media_urls.images[0]} alt={participant.full_name} className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${participant.status === 'evicted' ? 'grayscale opacity-50' : ''}`} />
                   </div>
                   <div className="p-4 border-t border-[#262626]">
                     <h5 className="text-white font-black uppercase text-sm truncate">{participant.full_name}</h5>
                     <p className="text-[#d4af37] text-xs font-serif italic truncate">"{participant.nickname}"</p>
                   </div>
                 </div>
                 <div className="px-4 pb-4">
                   <button 
                     onClick={(e) => {
                       e.stopPropagation();
                       router.push(`/contestants/${participant.id}`);
                     }}
                     className="w-full bg-[#161616] text-[#A3A3A3] hover:bg-[#d4af37] hover:text-black text-[10px] font-bold uppercase tracking-widest py-2 rounded-lg transition-all border border-[#262626] hover:border-[#d4af37] text-center cursor-pointer font-mono"
                   >
                     View Profile
                   </button>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </section>

      {/* Section 6: Connect with Regional Representatives */}
      <section className="w-full py-24 bg-gradient-to-b from-[#050B14] to-black border-t border-[#262626]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <div className="bg-[#0a0a0a] border border-[#262626] rounded-[3rem] p-12 md:p-20 relative overflow-hidden flex flex-col items-center text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
            
            <h3 className="text-3xl md:text-5xl font-serif text-white uppercase tracking-widest mb-6">
              Connect with your <span className="text-[#d4af37]">Region</span>
            </h3>
            <p className="text-[#A3A3A3] max-w-xl mb-12 italic">Direct lines to our official audition coordinators. No middlemen.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
               <a href="https://wa.me/233549834747" target="_blank" rel="noopener noreferrer" className="group bg-white/5 border border-[#262626] hover:border-[#d4af37] p-8 rounded-2xl transition-all">
                  <span className="block text-[10px] text-[#A3A3A3] font-black tracking-[0.3em] uppercase mb-2">Ghana Headquarters</span>
                  <span className="block text-2xl font-black text-white mb-4 group-hover:text-[#d4af37] transition-colors">+233 54 983 4747</span>
                  <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#d4af37]">Message via WhatsApp &gt;</span>
               </a>
               <a href="https://wa.me/19296344138" target="_blank" rel="noopener noreferrer" className="group bg-white/5 border border-[#262626] hover:border-[#d4af37] p-8 rounded-2xl transition-all">
                  <span className="block text-[10px] text-[#A3A3A3] font-black tracking-[0.3em] uppercase mb-2">USA North America</span>
                  <span className="block text-2xl font-black text-white mb-4 group-hover:text-[#d4af37] transition-colors">+1 929 634 4138</span>
                  <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#d4af37]">Message via WhatsApp &gt;</span>
               </a>
            </div>
            
            <div className="mt-16 pt-16 border-t border-[#262626] w-full flex flex-col items-center">
              <p className="text-white font-serif italic text-xl mb-6">Ready to start the journey?</p>
              <Link href="/about" className="bg-[#d4af37] text-black px-12 py-5 rounded-full font-black uppercase tracking-widest shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:scale-105 transition-transform">
                Apply for Auditions Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {selectedParticipant && (
        <ParticipantModal 
          participant={selectedParticipant} 
          onClose={() => setSelectedParticipant(null)} 
        />
      )}

      {selectedAnnouncement && (
        <AnnouncementModal 
          announcement={selectedAnnouncement} 
          onClose={() => setSelectedAnnouncement(null)} 
        />
      )}

    </div>
  );
}
