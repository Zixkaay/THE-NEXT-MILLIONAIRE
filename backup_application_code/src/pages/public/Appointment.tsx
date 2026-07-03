import React, { useState } from 'react';
import { Mail, MessageCircle, ChevronRight, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AppointmentPage() {
  const [tab, setTab] = useState<'whatsapp' | 'email'>('whatsapp');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate email submission since there's no backend for this yet
    alert("Thank you! Your enquiry has been received. We'll be in touch shortly via email.");
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="bg-[#050B14] min-h-screen pt-32 md:pt-40 pb-24 text-white">
      <div className="max-w-4xl mx-auto px-6 xl:px-0">
        
        {/* Header content */}
        <div className="mb-10 text-center">
          <p className="text-[#d4af37] font-serif italic text-lg md:text-xl mb-4 flex items-center justify-center gap-2">
            <span>★</span> GET IN TOUCH <span>★</span>
          </p>
          <h1 className="text-3xl md:text-5xl font-serif text-white tracking-widest uppercase mb-4 drop-shadow-lg">
            Appointments & Enquiries
          </h1>
          <p className="text-[#A3A3A3] max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Choose your preferred method of contact. Whether you want an instant response via WhatsApp or an official enquiry via Email, we are here for you. No ShortCuts, No Excuses, No Second Chance.
          </p>
        </div>

        {/* The Tabs */}
        <div className="flex bg-[#0a0a0a] rounded-full border border-[#262626] p-1.5 md:p-2 mb-10 shadow-lg max-w-sm mx-auto">
           <button
             onClick={() => setTab('whatsapp')}
             className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-xs md:text-sm tracking-widest font-bold uppercase transition-all duration-300 ${tab === 'whatsapp' ? 'bg-[#d4af37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'text-[#A3A3A3] hover:text-white'}`}
           >
             <MessageCircle size={16} /> WhatsApp
           </button>
           <button
             onClick={() => setTab('email')}
             className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-xs md:text-sm tracking-widest font-bold uppercase transition-all duration-300 ${tab === 'email' ? 'bg-[#d4af37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'text-[#A3A3A3] hover:text-white'}`}
           >
             <Mail size={16} /> Email
           </button>
        </div>

        {/* Content Box */}
        <div className="bg-gradient-to-b from-[#0a0a0a] to-[#040810] border border-[#262626] rounded-2xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
          {/* Subtle gold glow inside */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37]/5 rounded-full blur-[100px] pointer-events-none" />

          {tab === 'whatsapp' ? (
            <div className="flex flex-col items-center">
              <MessageCircle className="w-16 h-16 text-[#d4af37] mb-6 drop-shadow-lg" />
              <h2 className="text-2xl md:text-3xl font-serif text-white mb-2">Direct Message Us</h2>
              <p className="text-[#A3A3A3] text-center max-w-lg mb-10 text-sm md:text-base">
                Click below to open a direct WhatsApp chat with our official regional representatives.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                {/* Ghana Rep */}
                <a 
                  href="https://wa.me/233549834747" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center justify-center border border-[#262626] hover:border-[#d4af37] bg-black/40 hover:bg-[#d4af37]/5 p-8 rounded-xl transition-all duration-300 cursor-pointer"
                >
                  <p className="text-[#A3A3A3] uppercase tracking-widest text-[10px] mb-2 font-bold">Region</p>
                  <h3 className="text-2xl font-black text-white tracking-widest mb-1 group-hover:text-[#d4af37] transition-colors">GHANA</h3>
                  <p className="text-[#d4af37] font-mono text-sm tracking-wider mb-6">+233 54 983 4747</p>
                  
                  <span className="flex border border-[#d4af37]/40 text-[#A6C0DE] group-hover:text-white px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest items-center gap-2 group-hover:bg-[#d4af37] group-hover:text-black group-hover:border-[#d4af37] transition-all">
                    Chat Now <ChevronRight size={14} />
                  </span>
                </a>

                {/* USA Rep */}
                <a 
                  href="https://wa.me/19296344138" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center justify-center border border-[#262626] hover:border-[#d4af37] bg-black/40 hover:bg-[#d4af37]/5 p-8 rounded-xl transition-all duration-300 cursor-pointer"
                >
                  <p className="text-[#A3A3A3] uppercase tracking-widest text-[10px] mb-2 font-bold">Region</p>
                  <h3 className="text-2xl font-black text-white tracking-widest mb-1 group-hover:text-[#d4af37] transition-colors">USA</h3>
                  <p className="text-[#d4af37] font-mono text-sm tracking-wider mb-6">+1 929 634 4138</p>
                  
                  <span className="flex border border-[#d4af37]/40 text-[#A6C0DE] group-hover:text-white px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest items-center gap-2 group-hover:bg-[#d4af37] group-hover:text-black group-hover:border-[#d4af37] transition-all">
                    Chat Now <ChevronRight size={14} />
                  </span>
                </a>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Mail className="w-16 h-16 text-[#d4af37] mb-6 drop-shadow-lg" />
              <h2 className="text-2xl md:text-3xl font-serif text-white mb-2">Send an Enquiry</h2>
              <p className="text-[#A3A3A3] text-center max-w-lg mb-8 text-sm md:text-base">
                Fill out the secure form below to send an official query directly to our team via email.
              </p>

              <form onSubmit={handleEmailSubmit} className="w-full max-w-2xl flex flex-col gap-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-[#A3A3A3] font-bold tracking-widest uppercase">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="bg-black/60 border border-[#262626] focus:border-[#d4af37] outline-none text-white px-4 py-3 text-sm transition-colors rounded-none placeholder:text-[#A3A3A3]/50"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-[#A3A3A3] font-bold tracking-widest uppercase">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="bg-black/60 border border-[#262626] focus:border-[#d4af37] outline-none text-white px-4 py-3 text-sm transition-colors rounded-none placeholder:text-[#A3A3A3]/50"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-[#A3A3A3] font-bold tracking-widest uppercase">Subject</label>
                  <input 
                    type="text" 
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="bg-black/60 border border-[#262626] focus:border-[#d4af37] outline-none text-white px-4 py-3 text-sm transition-colors rounded-none placeholder:text-[#A3A3A3]/50"
                    placeholder="Appointment Enquiry"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-[#A3A3A3] font-bold tracking-widest uppercase">Message</label>
                  <textarea 
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="bg-black/60 border border-[#262626] focus:border-[#d4af37] outline-none text-white px-4 py-3 text-sm transition-colors rounded-none resize-none placeholder:text-[#A3A3A3]/50"
                    placeholder="Please provide details about your enquiry..."
                  />
                </div>

                <button 
                  type="submit" 
                  className="mt-4 bg-gradient-to-r from-[#D4AF37] to-[#8C6600] text-black font-extrabold text-xs tracking-widest uppercase py-4 px-8 shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:opacity-90 transition-opacity flex items-center justify-center gap-2 self-center md:self-stretch md:w-auto"
                >
                  Send Message <Send size={14} />
                </button>
              </form>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
