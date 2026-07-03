'use client';

import React, { useState } from 'react';
import { submitContactMessageAction } from '@/features/contact/actions';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string | null }>({ type: null, message: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: null, message: null });

    try {
      const res = await submitContactMessageAction(formData);
      if (res.success) {
        setStatus({ type: 'success', message: 'Message sent successfully.' });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus({ type: 'error', message: res.message || 'Failed to send message.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'An unexpected error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#0a0a0a] border border-[#262626] rounded-3xl p-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-[#A3A3A3] pl-1 font-mono">Name</label>
          <input 
            type="text" 
            required 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full bg-[#161616] border border-[#262626] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-[#A3A3A3] pl-1 font-mono">Email</label>
          <input 
            type="email" 
            required 
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full bg-[#161616] border border-[#262626] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-[#A3A3A3] pl-1 font-mono">Subject</label>
        <input 
          type="text" 
          required 
          value={formData.subject}
          onChange={(e) => setFormData({...formData, subject: e.target.value})}
          className="w-full bg-[#161616] border border-[#262626] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]"
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-[#A3A3A3] pl-1 font-mono">Message</label>
        <textarea 
          required 
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData({...formData, message: e.target.value})}
          className="w-full bg-[#161616] border border-[#262626] rounded-xl p-4 text-sm text-white outline-none focus:border-[#d4af37]"
        />
      </div>
      
      <button 
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-[#d4af37] to-[#f2a900] text-black font-black uppercase text-xs py-4 rounded-xl hover:opacity-95 transition-all flex items-center justify-center gap-2"
      >
        <Send size={15} /> {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>

      {status.message && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-2 ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          {status.type === 'success' ? <CheckCircle size={15}/> : <AlertCircle size={15}/>}
          {status.message}
        </div>
      )}
    </form>
  );
}
