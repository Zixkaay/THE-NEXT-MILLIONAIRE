'use client';

import React from 'react';
import { ParticipantManager } from '@/features/participants/components/ParticipantManager';

export default function AdminParticipantsPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1 text-left">
        <p className="text-text-sub text-xs font-black uppercase tracking-widest">Database Console</p>
        <h1 className="text-3xl font-black text-white tracking-tight">Contestants Library</h1>
      </header>

      <ParticipantManager />
    </div>
  );
}
