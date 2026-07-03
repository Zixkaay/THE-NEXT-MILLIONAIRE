import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { Settings, ShieldAlert } from 'lucide-react';

export function AdminDashboard() {
  const { settings, participants, updateSettings } = useAppStore();

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
            settings.registration_open ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          )}>
            Registration: {settings.registration_open ? 'OPEN' : 'CLOSED'}
          </div>
          <div className={cn(
            "px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide",
            settings.voting_enabled ? "bg-blue-100 text-blue-800" : "bg-gray-200 text-gray-800"
          )}>
            Voting: {settings.voting_enabled ? 'ENABLED' : 'DISABLED'}
          </div>
        </div>
      </header>

      {/* Main Column */}
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
            onClick={() => updateSettings({ registration_open: !settings.registration_open })}
            className={cn(
              "w-11 h-6 rounded-full relative transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
              settings.registration_open ? "bg-success" : "bg-gray-300"
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
            onClick={() => updateSettings({ voting_enabled: !settings.voting_enabled })}
            className={cn(
              "w-11 h-6 rounded-full relative transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
              settings.voting_enabled ? "bg-success" : "bg-gray-300"
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
            <div key={p?.id || index} className="border border-border rounded-lg overflow-hidden relative bg-white">
              <div className={cn(
                "absolute top-2 left-2 text-white px-2 py-1 text-[10px] font-extrabold rounded z-10",
                index === 0 ? "bg-accent" : "bg-slate-400"
              )}>
                {index + 1}{index === 0 ? 'ST' : index === 1 ? 'ND' : 'RD'} RUNNER
              </div>
              
              {p?.status === 'Evicted' && (
                <div className="absolute top-5 -right-8 bg-danger text-white py-1 px-10 text-[10px] font-extrabold rotate-45 shadow-md flex items-center justify-center z-20">
                  <ShieldAlert size={10} className="mr-1" />
                  ELIMINATED
                </div>
              )}

              <div className="h-[140px] bg-slate-200 flex items-center justify-center overflow-hidden">
                 {p?.media_urls?.images?.[0] ? (
                   <img src={p.media_urls.images[0]} alt={p.full_name} className="w-full h-full object-cover" />
                 ) : (
                   <span className="text-slate-400 font-bold text-sm">IMG // 0{index + 1}</span>
                 )}
              </div>
              <div className="p-3">
                <h5 className="font-semibold text-[14px] text-text-main leading-tight truncate">{p?.full_name || 'Unassigned'}</h5>
                <span className="text-[12px] text-text-sub">@{p?.nickname || 'N/A'}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Right Column: Settings & Data */}
      <aside className="flex flex-col gap-6">
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h3 className="text-sm font-bold text-text-sub mb-4 uppercase tracking-wider">Dynamic Form Logic</h3>
          <div className="font-mono text-[11px] bg-slate-50 p-3 rounded-md text-slate-600 border border-border overflow-x-auto">
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
        
        <div className="bg-card flex-1 rounded-xl border border-border p-6 shadow-sm">
          <h3 className="text-sm font-bold text-text-sub mb-4 uppercase tracking-wider">Media Source</h3>
          <div className="flex flex-col gap-3">
            <div className="p-2.5 border border-accent rounded-md text-[12px] text-accent bg-blue-50 font-medium cursor-pointer hover:bg-blue-100 transition-colors">
              Cloudinary Signed Widget
            </div>
            <div className="p-2.5 border border-border rounded-md text-[12px] text-text-main cursor-pointer hover:bg-slate-50 transition-colors">
              Internal Library (Supabase)
            </div>
            <div className="p-2.5 border border-border rounded-md text-[12px] text-text-main cursor-pointer hover:bg-slate-50 transition-colors">
              External URL Link
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
