import { Link, useLocation } from 'react-router-dom';
import { CircuitBoard, Menu, X, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DeveloperBadge } from './DeveloperBadge';
import React, { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function Sidebar({ mobileOpen, setMobileOpen }: { mobileOpen?: boolean, setMobileOpen?: (val: boolean) => void }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard Overview', path: '/administrator' },
    { label: 'Participants Library', path: '/administrator/participants' },
    { label: 'Newsroom CMS', path: '/administrator/newsroom' },
    { label: 'Voting Analytics', path: '/administrator/analytics' },
    { label: 'Media Manager', path: '/administrator/media' },
    { label: 'Dynamic Form Builder', path: '/administrator/form-builder' },
    { label: 'Global Settings', path: '/administrator/settings' },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-[100] md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setMobileOpen?.(false)}
        />
      )}
      
      <aside className={cn(
        "w-64 bg-sidebar text-white p-6 flex flex-col gap-8 shrink-0 h-screen overflow-y-auto fixed md:relative z-[110] transition-transform duration-300 md:translate-x-0 border-r border-[#262626]",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between">
          <div className="text-[18px] font-extrabold tracking-tight text-accent border-b border-white/10 pb-4 flex flex-1 items-center gap-2">
            <CircuitBoard size={20} />
            NBP // ADMIN
          </div>
          <button className="md:hidden text-[#A3A3A3] mb-4 hover:text-white" onClick={() => setMobileOpen?.(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path === '/administrator' && location.pathname === '/administrator');
            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setMobileOpen?.(false)}
                className={cn(
                  "text-sm opacity-70 px-3 py-3 rounded-md cursor-pointer flex items-center gap-3 transition-colors font-medium",
                  isActive ? "bg-[#d4af37]/20 text-[#d4af37] opacity-100 font-bold" : "hover:bg-white/5 hover:opacity-100"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="mt-auto pt-6 border-t border-white/10 space-y-3">
           {user && (
             <div className="px-3 py-2 bg-white/5 rounded-xl border border-white/5">
               <p className="text-[10px] text-[#A3A3A3] uppercase tracking-wider font-bold">Logged In As</p>
               <p className="text-xs text-white truncate font-medium mt-0.5" title={user.email}>{user.email}</p>
               <p className="text-[9px] text-[#d4af37] uppercase tracking-widest font-black mt-0.5">{user.role}</p>
             </div>
           )}
           <Link to="/" className="text-sm opacity-70 px-3 py-2.5 rounded-md hover:bg-white/5 hover:opacity-100 flex items-center gap-3 font-medium">
              &larr; Back to Site
           </Link>
           <button 
             onClick={async () => {
               await logout();
               window.location.href = '/administrator/login';
             }}
             className="w-full text-left text-sm text-red-500 opacity-70 px-3 py-2.5 rounded-md hover:bg-red-500/10 hover:text-red-400 hover:opacity-100 flex items-center gap-3 font-medium transition-all cursor-pointer"
           >
             <LogOut size={16} />
             Sign Out
           </button>
        </div>
      </aside>
    </>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-bg overflow-hidden text-text-main w-full">
      <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />
      
      <main className="flex-1 overflow-y-auto relative flex flex-col">
        {/* Mobile top bar for admin */}
        <div className="md:hidden bg-card border-b border-border p-4 flex items-center gap-3 sticky top-0 z-50">
          <button onClick={() => setMobileSidebarOpen(true)} className="text-[#A3A3A3] hover:text-[#d4af37]">
            <Menu size={24} />
          </button>
          <span className="font-bold uppercase tracking-widest text-sm text-[#d4af37]">Admin Panel</span>
        </div>
        
        <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-6 w-full flex-1">
          {children}
        </div>
      </main>
      
      <DeveloperBadge />
    </div>
  );
}
