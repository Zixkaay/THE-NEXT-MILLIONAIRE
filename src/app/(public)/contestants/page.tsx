'use client';
import { useAppStore } from '@/store/useAppStore';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ParticipantModal } from '@/components/ParticipantModal';
import { DatabaseParticipant } from '@/types/database';
import { Trophy, Star, Crown } from 'lucide-react';

export default function ContestantsPage() {
  const { participants, syncParticipants } = useAppStore();
  const router = useRouter();
  const [selectedParticipant, setSelectedParticipant] = useState<DatabaseParticipant | null>(null);

  useEffect(() => {
    syncParticipants().catch(console.error);
  }, [syncParticipants]);

  const activeParticipants = participants.filter(p => p.status === 'qualified' || p.status === 'evicted');
  
  const rank1 = activeParticipants.find(p => p.ranking === 1);
  const rank2 = activeParticipants.find(p => p.ranking === 2);
  const rank3 = activeParticipants.find(p => p.ranking === 3);
  
  const unranked = activeParticipants.filter(p => !p.ranking || p.ranking > 3).sort((a, b) => b.vote_count - a.vote_count);

  const handleSelect = (participant: DatabaseParticipant) => {
    console.log("CONTESTANTS PAGE: Routing to participant profile:", participant.full_name);
    router.push(`/contestants/${participant.id}`);
  };


  return (
    <div className="bg-bg min-h-screen pt-40 md:pt-48 pb-12 animate-in fade-in duration-500">
      <div className="max-w-[1240px] mx-auto px-6">
        
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">Official <span className="text-[#d4af37]">Contestants</span></h1>
          <p className="text-[#A3A3A3] text-lg max-w-2xl mx-auto">The live hierarchy of the Next Billionaire Path. Cast your votes securely to keep your favorites in the competition.</p>
        </div>

        {rank1 ? (
          <div className="mb-8 w-full bg-[#0a0a0a] border-2 border-[#d4af37] rounded-[2rem] overflow-hidden flex flex-col md:flex-row group cursor-pointer shadow-[0_0_30px_rgba(212,175,55,0.15)] relative" onClick={() => handleSelect(rank1)}>
            <div className="absolute top-4 sm:top-6 right-4 sm:right-6 bg-[#d4af37] text-black font-black text-[10px] sm:text-xs md:text-sm uppercase tracking-widest px-4 sm:px-6 py-1.5 sm:py-2 rounded-full z-20 flex items-center gap-1 sm:gap-2 shadow-lg">
              <Crown size={14} className="sm:w-4 sm:h-4" /> 1st Place
            </div>
            {rank1.status === 'evicted' && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#ef4444] text-white font-black text-2xl sm:text-4xl uppercase tracking-[0.2em] sm:tracking-[0.3em] px-8 sm:px-12 py-3 sm:py-4 -rotate-12 outline outline-2 sm:outline-4 outline-[#ef4444] outline-offset-2 sm:outline-offset-2 z-30 shadow-2xl whitespace-nowrap overflow-hidden max-w-[90%] text-center">
                EVICTED
              </div>
            )}
            <div className={`w-full md:w-[45%] h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden relative ${rank1.status === 'evicted' ? 'opacity-50 grayscale' : ''}`}>
              <img src={rank1.media_urls.images[0]} alt={rank1.full_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A101D] to-transparent block md:hidden"></div>
            </div>
            <div className="w-full md:w-[55%] p-6 sm:p-8 md:p-16 flex flex-col justify-center relative bg-gradient-to-l from-[#0A101D] via-[#0A101D] to-transparent">
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white uppercase break-words leading-none mb-2">{rank1.full_name}</h2>
              <span className="text-[#d4af37] text-lg sm:text-xl font-bold font-serif italic mb-4 sm:mb-6">"{rank1.nickname}"</span>
              <p className="text-[#A3A3A3] text-xs sm:text-sm leading-relaxed mb-6 sm:mb-8 max-w-md line-clamp-3">{rank1.bio}</p>
              
              <div className="flex items-center gap-4 sm:gap-6 mb-6 sm:mb-8 bg-black/40 p-3 sm:p-4 rounded-xl border border-[#262626] w-full sm:w-max justify-center sm:justify-start">
                <Trophy className="text-[#d4af37]" size={28} />
                <div className="flex flex-col">
                  <span className="text-[#a3a3a3] text-[10px] sm:text-xs uppercase tracking-widest font-bold">Total Power Votes</span>
                  <span className="text-2xl sm:text-3xl font-black text-white">{rank1.vote_count.toLocaleString()}</span>
                </div>
              </div>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(rank1);
                }}
                className="bg-[#d4af37] text-black text-xs sm:text-sm font-bold uppercase tracking-widest py-3 sm:py-4 px-6 sm:px-10 rounded-full hover:bg-white transition-colors w-full sm:w-max text-center cursor-pointer"
              >
                View Full Profile
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-8 w-full bg-[#0a0a0a] border border-[#262626] rounded-[2rem] p-16 text-center shadow-xl">
             <h2 className="text-[#d4af37] text-2xl font-bold uppercase tracking-widest mb-2">Event Branding Banner</h2>
             <p className="text-[#A3A3A3]">No 1st Place participant currently assigned by Admin.</p>
          </div>
        )}

        {(rank2 || rank3) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12">
            {[rank2, rank3].map((participant, i) => {
              if(!participant) return null;
              return (
                <div key={participant.id} onClick={() => handleSelect(participant)} className="bg-[#0a0a0a] border border-[#262626] rounded-3xl overflow-hidden cursor-pointer group hover:border-[#d4af37] transition-colors relative flex flex-col sm:flex-row">
                  <div className={`absolute top-4 right-4 bg-white text-black font-black text-xs uppercase tracking-widest px-4 py-1.5 rounded-full z-20 flex items-center gap-1 shadow-lg`}>
                    <Star size={12} /> {participant.ranking === 2 ? '2nd Place' : '3rd Place'}
                  </div>
                  {participant.status === 'evicted' && (
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#ef4444] text-white font-black text-xl sm:text-2xl uppercase tracking-[0.2em] px-6 py-2 -rotate-12 outline outline-1 outline-[#ef4444] outline-offset-2 z-30 shadow-xl overflow-hidden text-center whitespace-nowrap">
                      EVICTED
                    </div>
                  )}
                  <div className={`w-full sm:w-[40%] aspect-square sm:aspect-auto sm:h-full min-h-[220px] overflow-hidden ${participant.status === 'evicted' ? 'opacity-50 grayscale' : ''}`}>
                    <img src={participant.media_urls.images[0]} alt={participant.full_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="w-full sm:w-[60%] p-6 flex flex-col justify-between relative z-10">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-white uppercase mb-1">{participant.full_name}</h3>
                      <span className="text-[#d4af37] text-sm font-serif italic mb-4 block">"{participant.nickname}"</span>
                    </div>
                    <div className="space-y-4">
                      <div className="flex flex-col bg-black border border-[#262626] rounded-lg p-3">
                        <span className="text-[#a3a3a3] text-[9px] uppercase tracking-widest font-bold">Votes</span>
                        <span className="text-xl font-bold text-white">{participant.vote_count.toLocaleString()}</span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(participant);
                        }}
                        className="w-full bg-[#1A1A1A] text-white hover:bg-[#d4af37] hover:text-black text-[11px] font-black uppercase tracking-widest py-3 px-4 rounded-xl transition-all border border-[#262626] hover:border-[#d4af37] text-center cursor-pointer"
                      >
                        View Profile & Vote
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {unranked.length > 0 && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px bg-[#262626] flex-1"></div>
              <h3 className="text-[#A3A3A3] text-sm uppercase tracking-widest font-bold">The Brigade</h3>
              <div className="h-px bg-[#262626] flex-1"></div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {unranked.map((participant, index) => (
                <div 
                  key={participant.id} 
                  onClick={() => handleSelect(participant)}
                  className={`bg-[#0a0a0a] border border-[#262626] rounded-xl overflow-hidden cursor-pointer hover:border-[#d4af37] transition-colors flex flex-col group relative ${participant.status === 'evicted' ? 'opacity-70 font-black' : ''}`}
                >
                  {participant.status === 'evicted' && (
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#ef4444] text-white font-black text-xl md:text-xl uppercase tracking-[0.2em] px-4 py-2 -rotate-12 outline outline-1 outline-[#ef4444] outline-offset-2 z-30 shadow-xl pointer-events-none text-center whitespace-nowrap">
                      EVICTED
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-black/80 border border-[#262626] text-white font-bold text-[10px] px-2 py-1 rounded z-20 font-black">
                    Pos #{index + 4}
                  </div>
                  <div className={`aspect-square sm:aspect-[4/5] overflow-hidden relative ${participant.status === 'evicted' ? 'grayscale opacity-55' : 'grayscale group-hover:grayscale-0'}`}>
                    <img 
                      src={participant.media_urls.images[0]} 
                      alt={participant.full_name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black via-black/80 to-transparent pt-12">
                       <h3 className="text-lg font-black text-white uppercase leading-tight truncate">{participant.full_name}</h3>
                       <span className="text-[#d4af37] text-xs font-serif italic truncate block">"{participant.nickname}"</span>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col gap-3 bg-black border-t border-[#1F1F1F]">
                     <div className="flex justify-between items-center animate-out transition-all">
                       <span className="text-[#a3a3a3] text-[9px] uppercase font-bold tracking-widest">Votes</span>
                       <span className="text-sm font-bold text-white">{participant.vote_count.toLocaleString()}</span>
                     </div>
                     <button 
                       onClick={(e) => {
                         e.stopPropagation();
                         handleSelect(participant);
                       }}
                       className="w-full bg-[#161616] text-[#A3A3A3] hover:text-white hover:bg-[#d4af37] hover:text-black text-[10px] sm:text-[11px] font-bold uppercase tracking-widest py-2 px-3 rounded-lg transition-all border border-[#262626] hover:border-[#d4af37] text-center cursor-pointer"
                     >
                       View Profile
                     </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {selectedParticipant && (
        <ParticipantModal 
          participant={selectedParticipant} 
          onClose={() => setSelectedParticipant(null)} 
        />
      )}
    </div>
  );
}
