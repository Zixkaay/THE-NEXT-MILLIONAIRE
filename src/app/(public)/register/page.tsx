'use client';

import React, { useState } from 'react';
import { Mail, MessageCircle, ChevronRight, Send, HelpCircle, Trophy, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';
import { RegistrationForm } from '@/components/RegistrationForm';

export default function RegisterPage() {
  const { settings } = useAppStore();
  const [tab, setTab] = useState<'form' | 'contact'>('form');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thank you! Your enquiry has been received. We'll be in touch shortly via email.");
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const isRegistrationOpen = settings?.registration_open !== false;

  return (
    <div className="bg-[#050B14] min-h-screen pt-32 md:pt-40 pb-24 text-white animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto px-6 xl:px-0">
        
        {/* Header content */}
        <div className="mb-12 text-center">
          <p className="text-[#d4af37] font-serif italic text-lg md:text-xl mb-4 flex items-center justify-center gap-2">
            <span>★</span> SEASON AUDITIONS <span>★</span>
          </p>
          <h1 className="text-3xl md:text-6xl font-serif text-white tracking-widest uppercase mb-4 drop-shadow-lg">
            Registration System
          </h1>
          <p className="text-[#A3A3A3] max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Begin your custom ascendancy to raw industry leadership. Complete your digital registration, upload your audition assets, secure with verified payment steps, and lock in your position.
          </p>
        </div>

        {/* Choice of direct registration form vs direct support channels */}
        <div className="flex bg-[#0a0a0a] rounded-full border border-[#262626] p-1.5 md:p-2 mb-12 shadow-lg max-w-md mx-auto">
           <button
             onClick={() => setTab('form')}
             className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-xs md:text-sm tracking-widest font-bold uppercase transition-all duration-300 ${tab === 'form' ? 'bg-[#d4af37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'text-[#A3A3A3] hover:text-white'}`}
           >
             <Trophy size={16} /> Apply Now
           </button>
           <button
             onClick={() => setTab('contact')}
             className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-xs md:text-sm tracking-widest font-bold uppercase transition-all duration-300 ${tab === 'contact' ? 'bg-[#d4af37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'text-[#A3A3A3] hover:text-white'}`}
           >
             <HelpCircle size={16} /> Contact Reps
           </button>
        </div>

        {tab === 'form' ? (
          <div className="w-full max-w-2xl mx-auto">
            {isRegistrationOpen ? (
              <div className="rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative bg-gradient-to-b from-[#F8F1E1] to-[#EFE4CE] overflow-hidden text-black">
                {/* Visual accent geometric lines */}
                <div 
                  className="absolute top-0 left-0 w-64 h-72 opacity-100 pointer-events-none" 
                  style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='103.92' viewBox='0 0 60 103.92' xmlns='http://www.w3.org/2000/svg'%3E%3Cg stroke='%23111111' stroke-width='1.5' stroke-opacity='0.85' fill='none'%3E%3Cpath d='M30 103.92V51.96M0 51.96l30 -17.32l30 17.32M0 51.96l30 17.32l30 -17.32M0 0l30 17.32l30 -17.32M30 17.32V51.96'/%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '60px 103.92px',
                    maskImage: 'linear-gradient(135deg, black 25%, transparent 65%)',
                    WebkitMaskImage: 'linear-gradient(135deg, black 25%, transparent 65%)'
                  }}
                />
                
                <div className="text-center mb-8 pb-5 border-b-2 border-dashed border-[#d4af37]/30 relative z-10">
                  <h2 className="text-3xl font-black text-[#1a1a1a] mb-2 uppercase tracking-tight">Official Auditions</h2>
                  <p className="text-[#A67C00] font-black uppercase tracking-widest text-xs">Complete Phase 7 Registration Form</p>
                </div>
                
                <div className="relative z-10">
                  <RegistrationForm />
                </div>
              </div>
            ) : (
              <div className="bg-[#0a0a0a] border border-[#262626] rounded-[2.5rem] p-12 text-center shadow-2xl max-w-lg mx-auto">
                <CheckCircle2 className="text-[#A3A3A3] w-20 h-20 mx-auto mb-6 opacity-40 animate-pulse" />
                <h2 className="text-white text-3xl font-black uppercase tracking-wider mb-3">Registration Closed</h2>
                <p className="text-[#A3A3A3] text-sm leading-relaxed mb-8">
                  The application window for this audition phase is currently closed. If you require specialized assistance or would like to enquire about future seasons, please contact our team.
                </p>
                <button 
                  onClick={() => setTab('contact')}
                  className="bg-[#d4af37] text-black hover:opacity-90 transition-opacity font-bold uppercase tracking-widest text-xs py-4 px-8 rounded-full"
                >
                  Message Official Representatives
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-5xl mx-auto">
            {/* Direct Representatives WhatsApp Column */}
            <div className="lg:col-span-5 space-y-6 flex flex-col justify-center">
              <div className="border border-[#262626] bg-black/40 p-8 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 rounded-full blur-xl pointer-events-none" />
                <MessageCircle className="w-12 h-12 text-[#d4af37] mb-6" />
                <h3 className="text-xl font-bold uppercase tracking-wide text-white mb-2">Direct Message Us</h3>
                <p className="text-sm text-[#A3A3A3] leading-relaxed mb-6">
                  Ready to audition but have region concerns? Reach out directly via WhatsApp to our area coordinators.
                </p>
                
                <div className="space-y-4">
                  <a 
                    href="https://wa.me/233549834747" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex justify-between items-center p-4 border border-[#262626] rounded-lg bg-black/60 hover:border-[#d4af37] transition-all"
                  >
                    <div>
                      <h4 className="text-sm font-bold tracking-wider">GHANA REP</h4>
                      <p className="text-xs text-[#d4af37] font-mono">+233 54 983 4747</p>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#d4af37]">Chat &rarr;</span>
                  </a>

                  <a 
                    href="https://wa.me/19296344138" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex justify-between items-center p-4 border border-[#262626] rounded-lg bg-black/60 hover:border-[#d4af37] transition-all"
                  >
                    <div>
                      <h4 className="text-sm font-bold tracking-wider">USA REP</h4>
                      <p className="text-xs text-[#d4af37] font-mono">+1 929 634 4138</p>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#d4af37]">Chat &rarr;</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Email Support Form Column */}
            <div className="lg:col-span-7 bg-gradient-to-b from-[#0a0a0a] to-[#040810] border border-[#262626] rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
              <Mail className="w-12 h-12 text-[#d4af37] mb-4" />
              <h3 className="text-2xl font-serif text-white mb-2">Official Enquiry Desk</h3>
              <p className="text-sm text-[#A3A3A3] mb-6">
                Fill this system desk form to deliver a direct ticket to our administrative staff.
              </p>

              <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-[#A3A3A3] font-bold tracking-widest uppercase">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="bg-black/60 border border-[#262626] focus:border-[#d4af37] outline-none text-white px-4 py-3 text-xs transition-colors rounded-none placeholder:text-[#A3A3A3]/50"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-[#A3A3A3] font-bold tracking-widest uppercase">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="bg-black/60 border border-[#262626] focus:border-[#d4af37] outline-none text-white px-4 py-3 text-xs transition-colors rounded-none placeholder:text-[#A3A3A3]/50"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-[#A3A3A3] font-bold tracking-widest uppercase">Subject</label>
                  <input 
                    type="text" 
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="bg-black/60 border border-[#262626] focus:border-[#d4af37] outline-none text-white px-4 py-3 text-xs transition-colors rounded-none placeholder:text-[#A3A3A3]/50"
                    placeholder="Contest Registration Ticket"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-[#A3A3A3] font-bold tracking-widest uppercase">Message</label>
                  <textarea 
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="bg-black/60 border border-[#262626] focus:border-[#d4af37] outline-none text-white px-4 py-3 text-xs transition-colors rounded-none resize-none placeholder:text-[#A3A3A3]/50"
                    placeholder="Kindly type your operational inquiries here..."
                  />
                </div>

                <button 
                  type="submit" 
                  className="mt-2 bg-gradient-to-r from-[#D4AF37] to-[#8C6600] text-black font-extrabold text-xs tracking-widest uppercase py-3.5 px-6 shadow-md hover:opacity-95 transition-opacity flex items-center justify-center gap-2 self-start w-full md:w-auto"
                >
                  Submit Inquiry <Send size={12} />
                </button>
              </form>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}
