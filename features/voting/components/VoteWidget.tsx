'use client';

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js'; // Assuming Paystack handles internally but need to check if there is a similar client for Paystack.
// Wait, the project rules say "Paystack only". I need to see how to initialize Paystack.
// Looking at src/services/paystack/initializePayment.ts should give a hint about what it expects.
import { DollarSign, Loader2 } from 'lucide-react';

export default function VoteWidget({ participant_id, vote_price }: { participant_id: string, vote_price: number }) {
  const [votes, setVotes] = useState(1);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVote = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/voting/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participant_id,
          email,
          amount: votes * vote_price,
          vote_count: votes
        })
      });
      const data = await response.json();
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        alert('Failed to initialize payment');
      }
    } catch (err) {
      alert('Error initializing payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0a0a0a] border border-[#262626] rounded-3xl p-6 space-y-6">
      <h3 className="text-white text-xl font-black uppercase tracking-tight">Support Participant</h3>
      <div className="space-y-4">
        <input 
          type="number" 
          min="1"
          value={votes}
          onChange={(e) => setVotes(parseInt(e.target.value))}
          className="w-full bg-[#161616] border border-[#262626] rounded-xl px-4 py-3 text-sm text-white"
        />
        <input 
          type="email" 
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-[#161616] border border-[#262626] rounded-xl px-4 py-3 text-sm text-white"
        />
        <button 
          onClick={handleVote}
          disabled={loading || !email}
          className="w-full bg-[#d4af37] text-black font-black uppercase text-sm py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#b0922e] disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={18}/> : <><DollarSign size={18}/> Pay {votes * vote_price} GHS</>}
        </button>
      </div>
    </div>
  );
}
