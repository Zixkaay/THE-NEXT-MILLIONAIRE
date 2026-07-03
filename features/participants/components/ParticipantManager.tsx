'use client';

import React, { useEffect, useState } from 'react';
import { getParticipantsAction, updateParticipantStatusAction, deleteParticipantAction } from '../actions/participants';
import { DatabaseParticipant, ParticipantStatus } from '@/types/database';
import { Loader2, Trash2, CheckCircle, XCircle, Clock, Award } from 'lucide-react';

export function ParticipantManager() {
  const [participants, setParticipants] = useState<DatabaseParticipant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const data = await getParticipantsAction();
      setParticipants(data);
    } catch (error) {
      console.error('Failed to fetch participants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: ParticipantStatus) => {
    const res = await updateParticipantStatusAction(id, status);
    if (res.success) {
      fetchParticipants();
    } else {
      alert(res.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this participant?')) return;
    const res = await deleteParticipantAction(id);
    if (res.success) {
      fetchParticipants();
    } else {
      alert(res.message);
    }
  };

  const getStatusIcon = (status: ParticipantStatus) => {
    switch (status) {
      case 'auditioned': return <CheckCircle className="text-green-500" size={16} />;
      case 'evicted': return <XCircle className="text-red-500" size={16} />;
      case 'qualified': return <Award className="text-yellow-500" size={16} />;
      case 'paid': return <CheckCircle className="text-blue-500" size={16} />;
      default: return <Clock className="text-zinc-500" size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="animate-spin text-[#d4af37] mb-4" size={32} />
        <span className="text-xs font-black text-[#A3A3A3] uppercase tracking-widest">Loading Participants...</span>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] border border-[#262626] rounded-3xl overflow-hidden shadow-xl text-left">
      <div className="p-6 border-b border-[#262626] flex justify-between items-center">
        <h2 className="text-white text-xl font-black uppercase tracking-tight">Participant Pool</h2>
        <span className="bg-[#1a1a1a] text-[#A3A3A3] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-[#262626]">
          {participants.length} Total
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-black/40 text-[10px] font-black text-[#666] uppercase tracking-widest border-b border-[#262626]">
              <th className="px-6 py-4">Participant</th>
              <th className="px-6 py-4">Current Status</th>
              <th className="px-6 py-4">Lifecycle Actions</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {participants.map((p) => (
              <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#262626] bg-[#111] shrink-0">
                      {p.media_urls?.images?.[0] ? (
                        <img src={p.media_urls.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500 font-bold text-xs uppercase">
                          {p.nickname?.[0] || p.full_name?.[0] || 'P'}
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="block text-sm font-black text-white">{p.full_name}</span>
                      <span className="block text-[10px] text-[#A3A3A3] italic">"{p.nickname || 'Contestant'}"</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(p.status)}
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">{p.status}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-wrap gap-2">
                    {p.status !== 'auditioned' && p.status !== 'qualified' && p.status !== 'evicted' && (
                      <button onClick={() => handleStatusChange(p.id, 'auditioned')} className="bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-black px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all">
                        Approve Audition
                      </button>
                    )}
                    {p.status === 'auditioned' && (
                      <button onClick={() => handleStatusChange(p.id, 'qualified')} className="bg-yellow-500/10 hover:bg-yellow-500 text-yellow-500 hover:text-black px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all">
                        Qualify for Voting
                      </button>
                    )}
                    {p.status !== 'evicted' && (p.status === 'qualified' || p.status === 'auditioned') && (
                      <button onClick={() => handleStatusChange(p.id, 'evicted')} className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-black px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all">
                        Evict
                      </button>
                    )}
                    {p.status === 'evicted' && (
                      <button onClick={() => handleStatusChange(p.id, 'auditioned')} className="bg-zinc-500/10 hover:bg-zinc-500 text-zinc-400 hover:text-black px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all">
                        Restore to Auditioned
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <button onClick={() => handleDelete(p.id)} className="text-[#333] hover:text-red-500 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
