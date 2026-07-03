import React, { useState } from 'react';
import { MapPin, Phone, Mail, Globe, FileText, ChevronRight, Code, Shield, Target, Zap, TrendingUp, Users, Presentation, Award, Star, Search, MessageCircle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

function ReadMore({ text, limit = 250 }: { text: string, limit?: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongText = text.length > limit;

  if (!isLongText) return <p className="text-[#A3A3A3] text-lg leading-relaxed mb-6 font-light">{text}</p>;

  return (
    <div className="mb-6">
      <p className="text-[#A3A3A3] text-lg leading-relaxed font-light">
        {isExpanded ? text : `${text.substring(0, limit)}...`}
      </p>
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-[#d4af37] text-sm font-bold uppercase tracking-widest mt-2 hover:underline"
      >
        {isExpanded ? 'Read Less' : 'Read More'}
      </button>
    </div>
  );
}

export function AboutPage() {
  const { settings } = useAppStore();

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact-section');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-bg min-h-screen pt-40 md:pt-48 pb-16 animate-in fade-in duration-500">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Hero Header */}
        <div className="text-center mb-24">
          <p className="text-[#d4af37] font-bold text-sm tracking-[0.4em] uppercase mb-4">The Official Movement</p>
          <h1 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter mb-6 leading-none">
            Billionaire’s <span className="text-[#d4af37]">Path</span> TV Show
          </h1>
          <div className="w-24 h-[2px] bg-[#d4af37] mx-auto mb-8"></div>
          <p className="text-[#A3A3A3] text-xl max-w-3xl mx-auto font-serif italic leading-relaxed">
            "No shortcuts. No excuses. No second chances."
          </p>
        </div>

        {/* Mission & Vision Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          <div className="bg-[#0a0a0a] border border-[#262626] p-10 md:p-14 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 blur-[60px] group-hover:bg-[#d4af37]/10 transition-colors" />
            <Globe className="text-[#d4af37] mb-6" size={40} />
            <h2 className="text-3xl font-black text-white uppercase mb-6 tracking-tight">Our Mission</h2>
            <ReadMore text="To discover, challenge, and elevate ambitious individuals by testing their discipline, hustle, leadership, and resilience through real-world competition. Our platform serves as a catalyst for growth, providing the necessary tools and environment for visionaries to realize their full potential." />
            <p className="text-white font-medium border-l-2 border-[#d4af37] pl-6 py-2 italic font-serif">
              Billionaire’s Path exists to prove that success is earned through action, sacrifice, and consistency—not shortcuts.
            </p>
          </div>
          
          <div className="bg-[#0a0a0a] border border-[#262626] p-10 md:p-14 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 blur-[60px] group-hover:bg-[#d4af37]/10 transition-colors" />
            <Target className="text-[#d4af37] mb-6" size={40} />
            <h2 className="text-3xl font-black text-white uppercase mb-6 tracking-tight">Our Vision</h2>
            <ReadMore text="To become the world’s most inspiring business-entertainment platform where ordinary people are transformed into extraordinary achievers. We envision a future where every dreamer has access to the resources and mentorship needed to build empires." />
            <p className="text-white font-medium border-l-2 border-[#d4af37] pl-6 py-2 italic font-serif">
              We aim to build a global movement that celebrates entrepreneurship, self-belief, wealth creation, and relentless growth.
            </p>
          </div>
        </section>

        {/* Objectives Section */}
        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white uppercase mb-4">Core Objectives</h2>
            <p className="text-[#A3A3A3] font-serif italic text-lg">The pillars of our strategic impact.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Discover Real Talent", desc: "Identify hungry, driven individuals with the mindset to succeed.", icon: Search },
              { title: "Create Opportunity", desc: "Give contestants a life-changing platform to grow, earn, and be seen.", icon: TrendingUp },
              { title: "Inspire Millions", desc: "Motivate viewers to pursue business, purpose, and personal excellence.", icon: Zap },
              { title: "Reward Hustle", desc: "Celebrate discipline, performance, sales ability, leadership, and results.", icon: Award },
              { title: "Build Future Leaders", desc: "Develop contestants into entrepreneurs, professionals, and role models.", icon: Users },
              { title: "Entertain at a High Level", desc: "Deliver premium, exciting television with drama, growth, and real stakes.", icon: Presentation }
            ].map((obj, i) => (
              <div key={i} className="bg-[#0a0a0a]/50 border border-[#262626] hover:border-[#d4af37]/50 p-8 rounded-2xl transition-all group">
                <obj.icon className="text-[#d4af37] mb-4 group-hover:scale-110 transition-transform" size={24} />
                <h3 className="text-white font-black uppercase text-sm mb-2 tracking-widest">{obj.title}</h3>
                <p className="text-[#A3A3A3] text-sm leading-relaxed">{obj.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-[#0a0a0a] border border-[#262626] p-8 rounded-2xl text-center">
            <h3 className="text-white font-black uppercase text-sm mb-2 tracking-[0.3em]">Build a Global Brand</h3>
            <p className="text-[#A3A3A3] text-sm leading-relaxed max-w-2xl mx-auto">Expand Billionaire’s Path into media, education, live events, products, and partnerships.</p>
          </div>
        </section>

        {/* About Us Split Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-32 items-center">
          <div>
            <p className="text-[#d4af37] font-bold text-sm tracking-[0.4em] uppercase mb-4">About Us</p>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase mb-8 leading-tight">Who We Are</h2>
            <div className="space-y-6 text-lg text-[#A3A3A3] font-light leading-relaxed">
              <ReadMore 
                limit={300}
                text="Billionaire’s Path is more than a television show—it is a movement built to discover ambition, reward hustle, and transform lives. We created a platform where discipline, resilience, leadership, and performance are tested in real time. Contestants do not win through luck. They rise through action, consistency, courage, and results. Billionaire’s Path combines entertainment, entrepreneurship, personal growth, and opportunity into one premium global experience. This ecosystem is designed to foster innovation and create a new generation of wealth-conscious leaders who understand that the path to success is paved with hard work and strategic thinking." 
              />
              <p className="text-white font-bold uppercase tracking-widest text-sm pt-4">This is where future leaders are made.</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#333] p-12 rounded-[3rem] shadow-2xl relative">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#d4af37]/10 rounded-full blur-3xl" />
            <h2 className="text-3xl font-black text-white uppercase mb-8">What We Believe</h2>
            <div className="space-y-8">
              <div className="border-l-4 border-[#d4af37] pl-8">
                <p className="text-2xl font-serif italic text-white mb-2">"Success should not be reserved for the privileged few."</p>
                <p className="text-[#d4af37] font-black uppercase text-xs tracking-[0.3em]">It should belong to those willing to earn it.</p>
              </div>
              <p className="text-[#A3A3A3] leading-relaxed">
                That is why every challenge, every decision, and every opportunity on Billionaire’s Path is built around merit, effort, and execution.
              </p>
            </div>
          </div>
        </section>

        {/* CEO Message Section */}
        <section className="mb-32 bg-[#0a0a0a] border border-[#262626] rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#d4af37]/5 to-transparent pointer-events-none" />
          <div className="max-w-3xl relative z-10">
            <h2 className="text-[#d4af37] font-bold text-sm tracking-[0.4em] uppercase mb-12">CEO / Founder Message</h2>
            <p className="text-2xl md:text-4xl font-serif text-white italic mb-12 leading-snug">
              "Welcome to Billionaire’s Path. This platform was born from one belief: greatness exists everywhere, but opportunity does not."
            </p>
            <div className="space-y-6 text-[#A3A3A3] text-lg font-light leading-relaxed mb-12">
              <ReadMore 
                limit={400}
                text="There are millions of talented people with drive, ideas, and hunger—but they lack the stage to prove themselves. Billionaire’s Path was created to change that. We are building a world where ambition is rewarded, hustle is respected, and winners are forged through real competition. This is not just entertainment. This is transformation. I invite you to join us on this journey of self-discovery and economic empowerment. Whether you are a contestant, a viewer, or a partner, your presence here is a step towards a more ambitious future." 
              />
              <p className="text-white italic">"Your path begins now."</p>
            </div>
            <div className="pt-8 border-t border-[#262626]">
              <p className="text-white font-black uppercase tracking-[0.2em] mb-1">Founder</p>
              <p className="text-[#d4af37] font-serif italic">Billionaire’s Path</p>
            </div>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white uppercase mb-4">Our Core Values</h2>
            <p className="text-[#A3A3A3] font-serif italic text-lg">The internal compass of our brand.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { v: "Discipline", d: "Success starts with habits, consistency, and commitment." },
              { v: "Integrity", d: "We believe in honest competition and earned victories." },
              { v: "Excellence", d: "Average is never the standard." },
              { v: "Courage", d: "Winners act when others hesitate." },
              { v: "Resilience", d: "Pressure creates power." },
              { v: "Leadership", d: "Great success lifts others too." },
              { v: "Results", d: "Talk is cheap. Performance matters." },
            ].map((val, i) => (
              <div key={i} className="group border-b border-[#262626] pb-8 hover:border-[#d4af37] transition-colors">
                <span className="text-[#d4af37] font-mono text-xs mb-4 block">0{i+1}</span>
                <h3 className="text-xl font-black text-white uppercase mb-3 group-hover:translate-x-2 transition-transform">{val.v}</h3>
                <p className="text-[#A3A3A3] text-sm leading-relaxed">{val.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why We Are Different & Investor Info */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-32">
          <div className="bg-[#050B14] border border-[#262626] p-12 rounded-[2.5rem] shadow-xl">
             <h2 className="text-2xl font-black text-white uppercase mb-8 flex items-center gap-4">
               <Shield className="text-[#d4af37]" /> Why We Are Different
             </h2>
             <ul className="space-y-4">
               {[
                 "Real opportunities, not fake drama",
                 "Real growth, not scripted hype",
                 "Real winners chosen through performance",
                 "Real inspiration for viewers worldwide",
                 "Premium entertainment with purpose"
               ].map((item, i) => (
                 <li key={i} className="flex items-start gap-4 text-[#A3A3A3]">
                   <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] mt-1.5 shrink-0" />
                   <span>{item}</span>
                 </li>
               ))}
             </ul>
          </div>
          
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#010101] border border-[#d4af37]/30 p-12 rounded-[2.5rem] shadow-2xl overflow-hidden relative group">
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#d4af37]/5 rounded-full blur-[100px]" />
            <h2 className="text-2xl font-black text-white uppercase mb-8 flex items-center gap-4">
               <TrendingUp className="text-[#d4af37]" /> Investor & Partner Relations
             </h2>
             <p className="text-[#A3A3A3] mb-8 leading-relaxed">
               Billionaire’s Path sits at the intersection of Reality TV, Entrepreneurship, and Talent Discovery. We invite strategic partners to join our global expansion.
             </p>
             <div className="grid grid-cols-2 gap-4">
                {['Sponsorships', 'Advertising', 'Streaming Rights', 'Merchandising'].map((rev, i) => (
                  <div key={i} className="bg-black/40 border border-[#262626] p-4 rounded-xl text-center">
                    <span className="text-white text-[10px] font-black uppercase tracking-widest">{rev}</span>
                  </div>
                ))}
             </div>
             <button 
               onClick={scrollToContact}
               className="w-full mt-8 bg-white text-black font-black uppercase text-xs tracking-widest py-4 rounded-full hover:bg-[#d4af37] transition-all hover:scale-[1.02] active:scale-[0.98]"
             >
               Investor Deck Request
             </button>
          </div>
        </section>

        {/* Executive Leadership Section */}
        <section className="mb-32">
          <div className="bg-white text-black rounded-[3rem] p-12 md:p-20 flex flex-col items-center text-center">
             <Users className="mb-6 opacity-30" size={48} />
             <h2 className="text-4xl md:text-6xl font-black uppercase mb-8 tracking-tighter">Executive Leadership</h2>
             <p className="text-lg md:text-xl text-black/70 max-w-4xl leading-relaxed mb-12">
               Leadership at Billionaire’s Path is more than management — it is vision, discipline, and the relentless pursuit of excellence. Our team is the driving force responsible for transforming bold ideas into world-class entertainment and life-changing opportunities.
             </p>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full text-left">
               {[
                 "Strategic growth and global expansion",
                 "Creative direction and show development",
                 "Financial planning and prize management",
                 "Brand partnerships and sponsorships",
                 "Contestant standards and fairness",
                 "Audience engagement and digital innovation"
               ].map((item, i) => (
                 <div key={i} className="border border-black/10 p-6 rounded-2xl flex items-center gap-4">
                   <CheckCircle2 size={20} className="text-black shrink-0" />
                   <span className="font-bold text-sm uppercase tracking-wide">{item}</span>
                 </div>
               ))}
             </div>

             <div className="mt-20 pt-12 border-t border-black/10 w-full">
               <p className="text-sm font-black uppercase tracking-[0.4em] mb-4">A Message From Leadership</p>
               <p className="text-2xl md:text-3xl font-serif italic text-black mb-6 max-w-3xl mx-auto">
                 "Success is never given. It is earned through courage, consistency, and commitment. We do not just build a television show — we build futures."
               </p>
               <p className="font-black uppercase tracking-widest text-xs">- Billionaire’s Path Executive Leadership Team -</p>
             </div>
          </div>
        </section>

        {/* Contact Section (Repurposed from original) */}
        <section id="contact-section" className="mb-32 grid grid-cols-1 md:grid-cols-2 gap-12 scroll-mt-32">
          <div className="bg-[#0a0a0a] border border-[#262626] p-12 rounded-[2.5rem] flex flex-col justify-center">
            <h2 className="text-3xl font-black text-white uppercase mb-8">Official Channels</h2>
            <div className="space-y-8">
               <div className="flex items-center gap-6 group">
                 <div className="w-12 h-12 rounded-full border border-[#262626] flex items-center justify-center group-hover:border-[#d4af37] transition-colors">
                   <MapPin className="text-[#A3A3A3] group-hover:text-[#d4af37]" />
                 </div>
                 <div>
                   <p className="text-[#A3A3A3] text-[10px] uppercase font-bold tracking-[0.2em]">Location</p>
                   <p className="text-white text-lg font-medium">Accra, Ghana & New York, USA</p>
                 </div>
               </div>
               <a href="https://wa.me/233549834747" target="_blank" rel="noopener noreferrer" className="flex items-center gap-6 group">
                 <div className="w-12 h-12 rounded-full border border-[#262626] flex items-center justify-center group-hover:border-[#22c55e] transition-colors">
                   <MessageCircle className="text-[#A3A3A3] group-hover:text-[#22c55e]" />
                 </div>
                 <div>
                   <p className="text-[#A3A3A3] text-[10px] uppercase font-bold tracking-[0.2em]">WhatsApp Support</p>
                   <p className="text-white text-lg font-medium">+233 54 983 4747</p>
                 </div>
               </a>
               <a href="mailto:contact@nextbillionairepath.com" className="flex items-center gap-6 group">
                 <div className="w-12 h-12 rounded-full border border-[#262626] flex items-center justify-center group-hover:border-[#d4af37] transition-colors">
                   <Mail className="text-[#A3A3A3] group-hover:text-[#d4af37]" />
                 </div>
                 <div>
                   <p className="text-[#A3A3A3] text-[10px] uppercase font-bold tracking-[0.2em]">Email</p>
                   <p className="text-white text-lg font-medium">contact@nextbillionairepath.com</p>
                 </div>
               </a>
            </div>
          </div>
          <div className="bg-[#d4af37] p-12 rounded-[2.5rem] flex flex-col items-center text-center justify-center shadow-[0_30px_60px_rgba(212,175,55,0.2)]">
            <h2 className="text-3xl font-black text-black uppercase mb-4">Start Your Path</h2>
            <p className="text-black/70 mb-8 font-serif italic text-lg">Official Phase 1 Auditions are currently live.</p>
            <a href="/appointment" className="bg-black text-white font-black uppercase text-xs tracking-[0.3em] py-5 px-10 rounded-full hover:scale-105 transition-transform flex items-center gap-3">
              Book Appointment <ChevronRight size={16} />
            </a>
          </div>
        </section>

         {/* Developer Spotlight (Mandated Section) */}
        <section className="w-full">
           <div className="bg-gradient-to-br from-[#0a0a0a] to-[#050B14] border-2 border-[#262626] hover:border-[#d4af37] rounded-3xl p-6 sm:p-8 md:p-12 flex flex-col md:flex-row items-center md:items-start gap-8 sm:gap-10 shadow-[0_0_30px_rgba(212,175,55,0.05)] relative overflow-hidden group transition-colors">
             <div className="absolute top-0 right-0 bg-[#d4af37] text-black font-black text-[8px] sm:text-[10px] uppercase tracking-widest px-4 sm:px-6 py-1.5 sm:py-2 rounded-bl-2xl">
               Developer Spotlight
             </div>
             <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 rounded-full border-4 border-[#333] group-hover:border-[#d4af37] p-1.5 sm:p-2 transition-colors shrink-0 overflow-hidden bg-black mt-6 sm:mt-0">
                <div className="w-full h-full bg-[#1a1a1a] rounded-full flex items-center justify-center text-[#d4af37]">
                  <Code size={40} className="sm:w-12 sm:h-12 w-8 h-8" />
                </div>
             </div>
             <div className="flex-1 text-center md:text-left z-10 w-full">
                <h3 className="text-[#d4af37] text-[10px] sm:text-sm font-bold uppercase tracking-widest mb-1 sm:mb-2 font-serif italic">Lead Software Architect</h3>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase mb-1">KWASIE</h2>
                <h3 className="text-lg sm:text-xl font-bold text-[#A3A3A3] uppercase tracking-wide mb-3 sm:mb-4">TECH INVENTIVE</h3>
                <p className="text-[#A3A3A3] text-sm sm:text-base leading-relaxed mb-6 max-w-2xl mx-auto md:mx-0">
                  Constructing the digital infrastructure and logical frameworks driving the Next Billionaire Path. Specializing in high-performance cloud solutions, scalable Next.js environments, and dynamic architecture tailored for grand-stage events.
                </p>
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center md:justify-start w-full">
                  <span className="flex items-center justify-center sm:justify-start gap-2 bg-[#1a1a1a] border border-[#333] px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest w-full sm:w-auto font-mono tracking-tighter"><Phone size={14} className="text-[#d4af37]"/> 233 59 308 3486</span>
                  <a href="mailto:techinventiveworks@gmail.com" className="flex items-center justify-center sm:justify-start gap-2 bg-[#1a1a1a] border border-[#333] px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:border-[#d4af37] transition-colors w-full sm:w-auto break-all"><Mail size={14} className="text-[#d4af37] shrink-0"/> <span className="truncate">techinventiveworks@gmail.com</span></a>
                </div>
             </div>
           </div>
        </section>

      </div>
    </div>
  );
}

// Additional minor component fix for missing import
function CheckCircle2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
