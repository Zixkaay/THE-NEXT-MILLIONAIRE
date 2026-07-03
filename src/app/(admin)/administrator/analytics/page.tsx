'use client';

import React, { useEffect, useState } from 'react';
import { getAnalyticsAction } from '@/features/admin-dashboard/actions';
import { BarChart3, TrendingUp, Users, DollarSign, Loader2, CheckCircle } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [metrics, setMetrics] = useState({
    totalParticipants: 0,
    qualifiedParticipants: 0,
    totalPayments: 0,
    totalVotes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
        const res = await getAnalyticsAction();
        if (res.success && res.data) {
            setMetrics(res.data);
        }
        setLoading(false);
    }
    loadMetrics();
  }, []);

  if (loading) {
      return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-[#d4af37]" /></div>
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <header>
        <p className="text-text-sub text-sm font-bold uppercase tracking-wider mb-1">Finances & Data</p>
        <h1 className="text-3xl font-black text-text-main tracking-tight">System Analytics</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-text-sub uppercase tracking-wider">Total Participants</h3>
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-[#d4af37]">
              <Users size={20} />
            </div>
          </div>
          <p className="text-4xl font-black text-text-main">{metrics.totalParticipants.toLocaleString()}</p>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-text-sub uppercase tracking-wider">Qualified Contenders</h3>
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle size={20} />
            </div>
          </div>
          <p className="text-4xl font-black text-text-main">{metrics.qualifiedParticipants.toLocaleString()}</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-text-sub uppercase tracking-wider">Total Revenue</h3>
            <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-white">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-4xl font-black text-text-main">{metrics.totalPayments.toLocaleString('en-US', { style: 'currency', currency: 'GHS' })}</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-text-sub uppercase tracking-wider">Total Votes</h3>
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-4xl font-black text-text-main">{metrics.totalVotes.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

