import { useAppStore } from '@/store/useAppStore';
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';

export function AdminAnalytics() {
  const { participants } = useAppStore();
  
  const totalVotes = participants.reduce((sum, p) => sum + p.vote_count, 0);
  const activeParticipants = participants.filter(p => p.status !== 'Evicted').length;
  // Mock logic assuming $0.50 per vote
  const estimatedRevenue = (totalVotes * 0.50).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <header>
        <p className="text-text-sub text-sm font-bold uppercase tracking-wider mb-1">Finances & Data</p>
        <h1 className="text-3xl font-black text-text-main tracking-tight">Voting Analytics</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-text-sub uppercase tracking-wider">Total Votes Cast</h3>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-accent">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-4xl font-black text-text-main">{totalVotes.toLocaleString()}</p>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-text-sub uppercase tracking-wider">Est. Revenue</h3>
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-success">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-4xl font-black text-text-main">{estimatedRevenue}</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-text-sub uppercase tracking-wider">Active Contenders</h3>
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sidebar">
              <Users size={20} />
            </div>
          </div>
          <p className="text-4xl font-black text-text-main">{activeParticipants}</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-text-sub uppercase tracking-wider">Evicted</h3>
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-danger">
              <BarChart3 size={20} />
            </div>
          </div>
          <p className="text-4xl font-black text-text-main">{participants.length - activeParticipants}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
         <h3 className="text-xl font-bold text-text-main mb-6">Vote Distribution Top 5</h3>
         <div className="space-y-6">
           {participants.sort((a, b) => b.vote_count - a.vote_count).slice(0, 5).map((p, idx) => {
             const percentage = totalVotes === 0 ? 0 : Math.round((p.vote_count / totalVotes) * 100);
             return (
               <div key={p.id}>
                 <div className="flex justify-between text-sm font-medium text-text-main mb-2">
                   <div className="flex items-center gap-3">
                     <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">#{idx + 1}</span>
                     <span>{p.full_name}</span>
                   </div>
                   <div className="flex items-center gap-4">
                     <span className="text-text-sub">{p.vote_count.toLocaleString()} votes</span>
                     <span className="font-bold text-accent w-10 text-right">{percentage}%</span>
                   </div>
                 </div>
                 <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                   <div className="bg-accent h-full rounded-full" style={{ width: `${percentage}%` }}></div>
                 </div>
               </div>
             );
           })}
         </div>
      </div>
    </div>
  );
}
