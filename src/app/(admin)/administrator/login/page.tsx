'use client';

import React, { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, error: authError, loading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setLocalError('Please fill in all layout fields.');
      return;
    }

    try {
      const success = await login(cleanEmail, cleanPassword);
      if (success) {
        router.refresh();
        router.push('/administrator');
      }
    } catch (err: any) {
      setLocalError(err.message || 'An unexpected authentication error occurred.');
    }
  };

  const activeError = localError || authError;

  return (
    <div className="min-h-screen bg-[#050b14] flex flex-col justify-center items-center p-4 selection:bg-[#d4af37]/30 selection:text-[#d4af37]">
      {/* Background Graphic Accents */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-20%] w-[60%] h-[60%] rounded-full bg-[#d4af37]/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[60%] rounded-full bg-[#3b82f6]/5 blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10 space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-[#d4af37]/10 animate-pulse blur-md" />
            <div className="w-16 h-16 rounded-2xl bg-black border border-[#d4af37]/30 flex items-center justify-center shadow-2xl relative">
              <img 
                src="https://res.cloudinary.com/dnhz6xwjz/image/upload/v1776840105/logo_ahkway.png" 
                alt="Logo" 
                className="w-11 h-11 object-contain drop-shadow-[0_2px_8px_rgba(214,175,55,0.2)]"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">Master CMS</h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-none">
              Next Billionaire Path Control Center
            </p>
          </div>
        </div>

        <div className="bg-[#080d1a] border border-[#d4af37]/20 rounded-3xl p-6 md:p-8 shadow-[0_15px_50px_rgba(0,0,0,0.8)] relative overflow-hidden text-left">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
          
          <div className="mb-6 flex gap-3 items-center">
            <div className="w-8 h-8 rounded-lg bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37]">
              <Shield size={16} />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider">Secured Entry</h2>
              <p className="text-[10px] text-slate-400">Strictly authorized operator portal</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {activeError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex gap-3 items-start animate-shake">
                <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={16} />
                <p className="text-xs text-red-300 leading-relaxed font-medium">{activeError}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Whitelist Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. operator@nbp.com"
                  className="w-full bg-[#050b14]/80 border border-slate-800 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/20 transition-all font-sans"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Access Credentials
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#050b14]/80 border border-slate-800 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/20 transition-all font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#d4af37] hover:bg-[#b5942b] text-black text-xs font-black uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin text-black" size={16} />
                  <span>Awaiting Gateway...</span>
                </>
              ) : (
                <span>Decrypt & Authenticate</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-900 text-center text-[10px] text-slate-500 font-sans tracking-wide">
            Designed for mobile-first administrators. Whitelisted emails only.
          </div>
        </div>

        <div className="text-center font-sans">
          <a 
            href="/" 
            className="text-[11px] text-[#d4af37]/60 hover:text-[#d4af37] transition-all font-bold uppercase tracking-wider"
          >
            ← Back to Public Gateway
          </a>
        </div>
      </div>
    </div>
  );
}
