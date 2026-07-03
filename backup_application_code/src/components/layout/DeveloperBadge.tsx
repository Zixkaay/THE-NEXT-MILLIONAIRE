import { Code2 } from 'lucide-react';

export function DeveloperBadge() {
  return (
    <div className="hidden md:flex fixed bottom-4 right-4 z-[1000] bg-black/80 backdrop-blur-md border border-[#d4af37]/30 px-4 py-2 rounded-xl shadow-2xl flex items-center gap-3 hover:border-[#d4af37] transition-colors cursor-pointer group">
      <div className="w-8 h-8 rounded-full bg-[#d4af37]/20 flex items-center justify-center text-[#d4af37]">
        <Code2 size={16} />
      </div>
      <div className="flex flex-col">
        <span className="text-white font-black text-sm leading-tight tracking-wider">KWASIE</span>
        <span className="text-[#d4af37] text-[10px] font-bold uppercase tracking-widest">Tech Inventive</span>
      </div>
    </div>
  );
}
