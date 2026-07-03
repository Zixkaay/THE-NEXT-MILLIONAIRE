'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { Settings, ShieldAlert, Users, CheckCircle2, CreditCard, Vote } from 'lucide-react';
import { getAnalyticsAction } from '@/features/admin-dashboard/actions';

export default function DashboardPage() {
  const { settings, participants, updateSettings } = useAppStore();
  const [metrics, setMetrics] = useState({
    totalParticipants: 0,
    qualifiedParticipants: 0,
    totalPayments: 0,
    totalVotes: 0
  });

  useEffect(() => {
    async function loadMetrics() {
      const res = await getAnalyticsAction();
      if (res.success && res.data) {
        setMetrics(res.data);
      }
    }
    loadMetrics();
  }, []);

  const runners = [
    participants.find(p => p.ranking === 1),
    participants.find(p => p.ranking === 2),
    participants.find(p => p.ranking === 3),
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <header className="col-span-full flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <p className="text-text-sub text-sm mb-1 font-medium tracking-wide">System Control Engine</p>
          <h1 className="text-3xl font-bold text-text-main">Master Dashboard</h1>
        </div>
        <div className="flex gap-3">
          <div className={cn(
            "px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide",
            settings.registration_open ? "bg-green-100/10 text-green-400 border border-green-500/20" : "bg-red-100/10 text-red-400 border border-red-500/20"
          )}>
            Registration: {settings.registration_open ? 'OPEN' : 'CLOSED'}
          </div>
          <div className={cn(
            "px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide",
            settings.voting_enabled ? "bg-blue-100/10 text-blue-400 border border-blue-500/20" : "bg-gray-200/10 text-gray-400 border border-gray-500/20"
          )}>
            Voting: {settings.voting_enabled ? 'ENABLED' : 'DISABLED'}
          </div>
        </div>
      </header>

      {/* Main Column */}
      <div className="space-y-6 text-left">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border p-4 rounded-xl">
            <div className="text-accent mb-2"><Users size={20} /></div>
            <div className="text-2xl font-black text-text-main">{metrics.totalParticipants}</div>
            <div className="text-[10px] text-text-sub uppercase font-bold tracking-widest mt-1">Total Reg</div>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl">
            <div className="text-emerald-500 mb-2"><CheckCircle2 size={20} /></div>
            <div className="text-2xl font-black text-text-main">{metrics.qualifiedParticipants}</div>
            <div className="text-[10px] text-text-sub uppercase font-bold tracking-widest mt-1">Qualified</div>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl">
            <div className="text-[#d4af37] mb-2"><CreditCard size={20} /></div>
            <div className="text-2xl font-black text-text-main">GH₵ {metrics.totalPayments.toLocaleString()}</div>
            <div className="text-[10px] text-text-sub uppercase font-bold tracking-widest mt-1">Revenue</div>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl">
            <div className="text-blue-500 mb-2"><Vote size={20} /></div>
            <div className="text-2xl font-black text-text-main">{metrics.totalVotes.toLocaleString()}</div>
            <div className="text-[10px] text-text-sub uppercase font-bold tracking-widest mt-1">Total Votes</div>
          </div>
        </div>

        <section className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h3 className="text-sm font-bold text-text-sub mb-5 uppercase tracking-wider flex items-center gap-2">
            <Settings size={16} /> System Controls
          </h3>
          
          <div className="flex justify-between items-center py-4 border-b border-border">
            <div>
              <h4 className="text-[15px] font-semibold text-text-main mb-1">Registration Switch</h4>
              <p className="text-[13px] text-text-sub">Toggle multi-step form visibility on Home Page</p>
            </div>
            <button 
              type="button"
              onClick={() => updateSettings({ registration_open: !settings.registration_open })}
              className={cn(
                "w-11 h-6 rounded-full relative transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
                settings.registration_open ? "bg-emerald-500" : "bg-gray-700"
              )}
            >
              <div className={cn(
                "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200",
                settings.registration_open ? "translate-x-5" : "translate-x-0"
              )} />
            </button>
          </div>

          <div className="flex justify-between items-center py-4 border-b border-border">
            <div>
              <h4 className="text-[15px] font-semibold text-text-main mb-1">Voting Engine</h4>
              <p className="text-[13px] text-text-sub">Activate Paystack-verified voting interface</p>
            </div>
            <button 
              type="button"
              onClick={() => updateSettings({ voting_enabled: !settings.voting_enabled })}
              className={cn(
                "w-11 h-6 rounded-full relative transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
                settings.voting_enabled ? "bg-emerald-500" : "bg-gray-700"
              )}
            >
              <div className={cn(
                "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200",
                settings.voting_enabled ? "translate-x-5" : "translate-x-0"
              )} />
            </button>
          </div>

          <h3 className="text-sm font-bold text-text-sub mt-8 mb-5 uppercase tracking-wider">
            Contestants Hierarchy (Weekly Runners)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {runners.map((p, index) => (
              <div key={p?.id || index} className="border border-border rounded-lg overflow-hidden relative bg-[#0a0a0a]">
                <div className={cn(
                  "absolute top-2 left-2 text-black px-2 py-1 text-[10px] font-extrabold rounded z-10",
                  index === 0 ? "bg-[#d4af37]" : "bg-slate-400"
                )}>
                  {index + 1}{index === 0 ? 'ST' : index === 1 ? 'ND' : 'RD'} RUNNER
                </div>
                
                {p?.status === 'evicted' && (
                  <div className="absolute top-5 -right-8 bg-red-600 text-white py-1 px-10 text-[10px] font-extrabold rotate-45 shadow-md flex items-center justify-center z-20">
                    <ShieldAlert size={10} className="mr-1" />
                    ELIMINATED
                  </div>
                )}

                <div className="h-[140px] bg-neutral-900 flex items-center justify-center overflow-hidden">
                   {p?.media_urls?.images?.[0] ? (
                     <img src={p.media_urls.images[0]} alt={p.full_name} className="w-full h-full object-cover" />
                   ) : (
                     <span className="text-slate-500 font-bold text-sm">IMG // {index + 1}</span>
                   )}
                </div>
                <div className="p-3">
                  <h5 className="font-semibold text-[14px] text-white leading-tight truncate">{p?.full_name || 'Unassigned'}</h5>
                  <span className="text-[12px] text-gray-400">@{p?.nickname || 'N/A'}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Right Column: Settings & Data */}
      <aside className="flex flex-col gap-6">
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h3 className="text-sm font-bold text-[#A3A3A3] mb-4 uppercase tracking-wider text-left">Dynamic Form Logic</h3>
          <div className="font-mono text-[11px] bg-[#050B14] p-3 rounded-md text-emerald-400 border border-border overflow-x-auto text-left">
            <pre>
{`{
  "step": 1,
  "fields": [
    {"id": "name", "type": "text"},
    {"id": "bio", "type": "jsonb"},
    {"id": "fee", "status": "paid"}
  ]
}`}
            </pre>
          </div>
        </div>
        
        <div className="bg-card flex-1 rounded-xl border border-border p-6 shadow-sm text-left">
          <h3 className="text-sm font-bold text-[#A3A3A3] mb-4 uppercase tracking-wider">Media Source</h3>
          <div className="flex flex-col gap-3">
            <div className="p-2.5 border border-[#d4af37]/40 rounded-md text-[12px] text-[#d4af37] bg-[#d4af37]/5 font-medium cursor-pointer hover:bg-[#d4af37]/10 transition-colors">
              Cloudinary Signed Widget
            </div>
            <div className="p-2.5 border border-border rounded-md text-[12px] text-white cursor-pointer hover:bg-white/5 transition-colors">
              Internal Library (Supabase)
            </div>
            <div className="p-2.5 border border-border rounded-md text-[12px] text-white cursor-pointer hover:bg-white/5 transition-colors">
              External URL Link
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
