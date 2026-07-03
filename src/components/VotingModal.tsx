import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { CreditCard, CheckCircle2 } from 'lucide-react';

export function VotingModal({ participantId, participantName, onClose }: { participantId: string; participantName: string; onClose: () => void }) {
  const { addVote } = useAppStore();
  const [votes, setVotes] = useState(10);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const pricePerVote = 50; // $0.50 per vote

  const handlePaystackCheckout = async () => {
    setIsProcessing(true);
    
    // Simulate payment transaction securely wrapping to our backend webhook logic
    setTimeout(async () => {
      // 1. Simulate Paystack successfully charging
      // 2. Trigger our own webhook mock directly
      console.log('Mocking webhook:', {
        event: 'charge.success',
        data: {
          amount: (votes * pricePerVote) * 100,
          metadata: {
            participantId,
            votesAdded: votes
          }
        }
      });
      
      // Update local state directly to reflect changes in the UI instantly
      addVote(participantId, votes);
      setIsProcessing(false);
      setIsSuccess(true);
      
      setTimeout(() => {
         onClose();
      }, 2000);
      
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-sidebar/80 backdrop-blur-sm z-[3000] flex items-center justify-center p-4 animate-in fade-in duration-200">
       <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl p-8 relative">
         {isSuccess ? (
           <div className="text-center space-y-4 py-8 animate-in zoom-in duration-300">
             <CheckCircle2 size={64} className="text-success mx-auto" />
             <h3 className="text-2xl font-bold text-text-main">Votes Confirmed!</h3>
             <p className="text-text-sub">Added {votes} votes to {participantName}</p>
           </div>
         ) : (
           <>
              <button onClick={onClose} className="absolute top-4 right-4 text-text-sub hover:text-text-main font-bold">X</button>
              <h3 className="text-xl font-bold text-text-main mb-2">Support {participantName}</h3>
              <p className="text-sm text-text-sub mb-6">Voting ensures your favored entrepreneur maintains their position in the gallery.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-text-sub uppercase tracking-wider block mb-2">How many votes? ($0.50 ea)</label>
                  <div className="flex bg-slate-100 rounded-lg p-1">
                    {[10, 50, 100, 500].map(amt => (
                      <button 
                        key={amt}
                        onClick={() => setVotes(amt)}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${votes === amt ? 'bg-white shadow text-accent' : 'text-slate-500 hover:text-text-main'}`}
                      >
                        {amt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex justify-between items-center text-sm">
                   <span className="font-bold text-slate-700">Total Purchase:</span>
                   <span className="font-black text-xl text-accent">${((votes * pricePerVote) / 100).toFixed(2)}</span>
                </div>

                <button 
                  onClick={handlePaystackCheckout}
                  disabled={isProcessing}
                  className="w-full py-4 bg-sidebar text-white font-bold rounded-xl shadow-md hover:bg-slate-800 transition-colors uppercase tracking-wider text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CreditCard size={18} /> {isProcessing ? 'Processing Paystack...' : 'Pay with Paystack'}
                </button>
              </div>
           </>
         )}
       </div>
    </div>
  );
}
