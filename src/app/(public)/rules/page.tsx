'use client';

import React, { useState, useEffect } from 'react';
import { 
  getWeeklyRulesAction, 
  getGeneralRulesAction, 
  getTermsAndConditionsAction 
} from '@/features/rules/actions';
import { DatabaseWeeklyRule, DatabaseGeneralRule } from '@/types/database';
import { 
  ShieldAlert, 
  BookOpen, 
  Clock, 
  CheckCircle, 
  Activity, 
  HelpCircle, 
  ArrowRight,
  Gavel,
  Scale,
  FileCheck
} from 'lucide-react';

export default function PublicRulesPage() {
  const [weeklyRules, setWeeklyRules] = useState<DatabaseWeeklyRule[]>([]);
  const [generalRules, setGeneralRules] = useState<DatabaseGeneralRule[]>([]);
  const [termsContent, setTermsContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [weekly, general, terms] = await Promise.all([
          getWeeklyRulesAction(),
          getGeneralRulesAction(),
          getTermsAndConditionsAction()
        ]);
        setWeeklyRules(weekly);
        setGeneralRules(general);
        setTermsContent(terms);
      } catch (err) {
        console.error('[PublicRulesPage] Error loading rules:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const activeWeekRule = weeklyRules.find(r => r.is_active);

  if (loading) {
    return (
      <div className="bg-bg min-h-screen pt-40 flex flex-col justify-center items-center">
        <div className="w-12 h-12 rounded-full border-4 border-t-[#d4af37] border-white/5 animate-spin mb-4" />
        <p className="text-[#A3A3A3] text-xs font-mono uppercase tracking-widest animate-pulse">Consulting Official Statutes...</p>
      </div>
    );
  }

  return (
    <div className="bg-bg min-h-screen pt-40 md:pt-48 pb-20 animate-in fade-in duration-500 text-left">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Page Header */}
        <div className="text-center mb-20">
          <p className="text-[#d4af37] font-bold text-sm tracking-[0.4em] uppercase mb-4">Official Statutes</p>
          <h1 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter mb-6 leading-none">
            Rules & <span className="text-[#d4af37]">Guidelines</span>
          </h1>
          <div className="w-24 h-[2px] bg-[#d4af37] mx-auto mb-6"></div>
          <p className="text-[#A3A3A3] text-base md:text-lg max-w-2xl mx-auto font-light leading-relaxed">
            The canonical framework governing compliance, timeline progress, voting integrity, and operational requirements.
          </p>
        </div>

        {/* ACTIVE RUNNING WEEK HIGHLIGHT */}
        {activeWeekRule && (
          <div className="mb-24 relative overflow-hidden bg-gradient-to-br from-[#121c0e] via-[#080d07] to-bg border border-emerald-500/25 p-8 md:p-12 rounded-[2.5rem] shadow-2xl group text-left">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] pointer-events-none" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 font-mono text-[10px] uppercase font-bold tracking-widest">
                    Current active milestone
                  </span>
                </div>
                <h2 className="text-white text-3xl font-black uppercase tracking-tight">
                  Week {activeWeekRule.week_number}: {activeWeekRule.title}
                </h2>
                <p className="text-[#a3a3a3] text-sm md:text-base max-w-3xl leading-relaxed">
                  {activeWeekRule.description}
                </p>
              </div>
              <div className="bg-[#121c0e] border border-emerald-500/30 p-5 rounded-3xl shrink-0 text-center flex flex-col justify-center items-center">
                <Clock size={32} className="text-emerald-400 mb-2" />
                <span className="text-[#A3A3A3] text-[9px] font-mono uppercase tracking-widest">TIMELINE STATUS</span>
                <span className="text-white text-xs font-black uppercase font-mono mt-1">IN PROGRESS</span>
              </div>
            </div>
          </div>
        )}

        {/* TIMELINE OUTLINE OF PROGRESS */}
        <section className="mb-24 text-left">
          <div className="flex items-center gap-3 mb-10 border-b border-white/5 pb-4">
            <Activity className="text-[#d4af37]" size={24} />
            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">Weekly Milestone Schedule</h2>
          </div>

          {weeklyRules.length === 0 ? (
            <p className="text-[#A3A3A3] text-sm font-mono">No milestone rules populated yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {weeklyRules.map((w) => (
                <div 
                  key={w.id} 
                  className={`border rounded-3xl p-6 relative flex flex-col justify-between transition-all duration-300 ${
                    w.is_active 
                      ? 'bg-gradient-to-b from-[#1c1404] to-bg border-[#d4af37]/40 shadow-xl' 
                      : 'bg-[#0a0a0a] border-[#222] hover:border-zinc-800'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-black tracking-widest uppercase font-mono px-2.5 py-1 rounded-md ${
                        w.is_active ? 'bg-[#d4af37] text-black' : 'bg-white/5 text-[#A3A3A3]'
                      }`}>
                        Week {w.week_number}
                      </span>
                      {w.is_active && (
                        <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-ping" />
                      )}
                    </div>
                    <h3 className="text-white text-base font-black uppercase tracking-tight">{w.title}</h3>
                    <p className="text-[#A3A3A3] text-xs leading-relaxed font-light">{w.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* GENERAL RULES & CRITERIA */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24 text-left">
          
          <div className="space-y-8">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <Scale className="text-[#d4af37]" size={24} />
              <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">General Regulations</h2>
            </div>

            {generalRules.length === 0 ? (
              <p className="text-[#A3A3A3] text-sm font-mono">No general regulations registered.</p>
            ) : (
              <div className="space-y-6">
                {generalRules.filter(r => r.id !== 'terms-conditions-static').map((rule, idx) => (
                  <div 
                    key={rule.id} 
                    className="bg-[#0a0a0a] border border-[#222] p-6 rounded-3xl space-y-3 hover:border-zinc-800 transition-colors"
                  >
                    <div className="flex items-center gap-2 text-[#d4af37] font-mono text-xs font-bold uppercase tracking-wider">
                      <FileCheck size={14} /> Rule Index #{rule.sort_order || (idx + 1)}
                    </div>
                    <h3 className="text-white text-md font-extrabold uppercase tracking-wider">{rule.title}</h3>
                    <p className="text-[#A3A3A3] text-xs leading-relaxed font-light">{rule.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TERMS AND CONDITIONS */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <Gavel className="text-[#d4af37]" size={24} />
              <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">Terms & Conditions</h2>
            </div>

            <div className="bg-[#0a0a0a] border border-[#222] p-8 rounded-[2rem] shadow-2xl relative overflow-hidden text-left overflow-y-auto max-h-[600px] prose prose-invert prose-xs scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#d4af37] to-[#A67C00]" />
              <div className="text-zinc-300 text-xs leading-relaxed font-light whitespace-pre-wrap space-y-4">
                {termsContent || 'Loading platform terms...'}
              </div>
            </div>
          </div>

        </section>

      </div>
    </div>
  );
}
