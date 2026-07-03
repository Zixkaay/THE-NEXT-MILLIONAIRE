'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { AlertCircle, CreditCard, Loader2 } from 'lucide-react';

export function VotingWidget() {
  const { settings, participants } = useAppStore();
  const [selectedId, setSelectedId] = useState('');
  const [voterEmail, setVoterEmail] = useState('');
  const [voteCount, setVoteCount] = useState(10);
  const [customVotes, setCustomVotes] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Filter only qualified/active participants
  const activeContestants = participants.filter(p => p.status === 'qualified');

  const pricePerVote = settings.vote_price || 1.00;
  const currentVotes = isCustom ? (parseInt(customVotes, 10) || 0) : voteCount;
  const totalCost = currentVotes * pricePerVote;

  const handleVoteSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);

    // Validate inputs
    if (!selectedId) {
      setErrorText('Please select the contestant you wish to support.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!voterEmail.trim() || !emailPattern.test(voterEmail)) {
      setErrorText('Please provide a valid voter email address for receipts.');
      return;
    }

    if (currentVotes <= 0) {
      setErrorText('Please enter or select a positive number of votes.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: voterEmail.trim(),
          participantId: selectedId,
          voteCount: currentVotes,
        }),
      });

      const result = await response.json();

      if (result.error) {
        setErrorText(result.message || 'Initialization failed.');
        setIsSubmitting(false);
        return;
      }

      // If successful, redirect user to the Paystack checkout url
      if (result.authorization_url) {
        window.location.href = result.authorization_url;
      } else {
        setErrorText('Failed to acquire secure gateway authorization.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error('[VotingWidget Error]:', err);
      setErrorText('Communication failure with payment server.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-[2rem] p-6 sm:p-8 shadow-2xl relative bg-gradient-to-b from-[#111827] to-[#030712] border border-[#d4af37]/40 overflow-hidden">
      {/* Intricate ambient backing glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/10 blur-3xl rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#d4af37]/5 blur-3xl rounded-full -z-10" />

      <div className="text-center mb-6 md:mb-8 pb-4 border-b border-white/[0.08]">
        <span className="text-[#d4af37] text-[10px] uppercase font-black tracking-[0.25em] block mb-1">Official Support Portal</span>
        <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">Support Contestant</h2>
        <p className="text-white/60 text-xs mt-1">Acquire votes to fast-track your candidate's journey.</p>
      </div>

      <form onSubmit={handleVoteSubmission} className="space-y-5 relative z-10">
        {errorText && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-red-200">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>{errorText}</span>
          </div>
        )}

        {/* 1. SELECT CONTESTANT */}
        <div>
          <label className="text-[10px] font-bold text-[#d4af37] uppercase tracking-wider block mb-2">
            Select Live Contestant
          </label>
          <div className="relative">
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white opacity-90 focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] transition-all cursor-pointer appearance-none"
            >
              <option value="" className="bg-black text-white/50">-- Select candidate --</option>
              {activeContestants.map((candidate) => (
                <option key={candidate.id} value={candidate.id} className="bg-black text-white">
                  {candidate.id} - {candidate.full_name} {candidate.nickname ? `"${candidate.nickname}"` : ''}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-white/40">
              ▼
            </div>
          </div>
        </div>

        {/* 2. THE VOTER EMAIL ADDRESS FIELD */}
        <div>
          <label className="text-[10px] font-bold text-[#d4af37] uppercase tracking-wider block mb-2">
            Your Email Address (For Receipts)
          </label>
          <input
            type="email"
            required
            value={voterEmail}
            onChange={(e) => setVoterEmail(e.target.value)}
            placeholder="voter@example.com"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] transition-all"
          />
        </div>

        {/* 3. SELECT VOTE AMOUNT */}
        <div>
          <label className="text-[10px] font-bold text-[#d4af37] uppercase tracking-wider block mb-2">
            Vote Allocation Tier
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[10, 50, 100, 500].map((amt) => (
              <button
                type="button"
                key={amt}
                onClick={() => {
                  setIsCustom(false);
                  setVoteCount(amt);
                  setErrorText(null);
                }}
                className={`py-2.5 text-xs font-black rounded-lg transition-all border ${
                  !isCustom && voteCount === amt
                    ? 'bg-gradient-to-r from-[#d4af37] to-[#f2a900] text-black border-transparent shadow-lg shadow-[#d4af37]/10'
                    : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                }`}
              >
                {amt}
              </button>
            ))}
          </div>

          <div className="mt-3">
            <button
              type="button"
              onClick={() => setIsCustom(!isCustom)}
              className="text-[10px] text-[#d4af37] font-semibold uppercase tracking-wider hover:underline"
            >
              {isCustom ? '← Use standard vote tiers' : '✎ Write custom count'}
            </button>
            
            {isCustom && (
              <input
                type="number"
                min="1"
                placeholder="Enter custom count (e.g. 250)"
                value={customVotes}
                onChange={(e) => {
                  setCustomVotes(e.target.value);
                  setErrorText(null);
                }}
                className="w-full mt-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
              />
            )}
          </div>
        </div>

        {/* 4. TOTAL METRIC SUMMARY */}
        <div className="bg-[#111827]/60 border border-white/5 rounded-2xl p-4 flex justify-between items-center">
          <div className="text-left">
            <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest block">Unit Rate</span>
            <span className="text-[10px] text-white/80 font-bold font-mono">GHC {pricePerVote.toFixed(2)} / vote</span>
          </div>
          <div className="text-right">
            <span className="text-[8px] font-bold text-[#d4af37] uppercase tracking-widest block">Support Total</span>
            <span className="text-lg font-black text-[#d4af37] font-mono">
              GHC {totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* 5. PAY WITH PAYSTACK ACTION */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f2a900] text-black font-black uppercase text-xs tracking-widest transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_25px_rgba(212,175,55,0.35)]"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Connecting to Paystack...
            </>
          ) : (
            <>
              <CreditCard size={14} />
              Proceed to Checkout
            </>
          )}
        </button>
      </form>
    </div>
  );
}
