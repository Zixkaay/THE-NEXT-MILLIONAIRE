'use client';

import React from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { AdminLayout } from '@/components/layout/AdminLayout';

export default function AdministratorLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === '/administrator/login';

  React.useEffect(() => {
    if (!loading && !isLoginPage && (!user || !isAdmin)) {
      router.push('/administrator/login');
    } else if (!loading && isLoginPage && user && isAdmin) {
      router.push('/administrator');
    }
  }, [user, loading, isAdmin, isLoginPage, router]);

  if (loading && !isLoginPage) {
    return (
      <div className="min-h-screen bg-[#050B14] flex flex-col items-center justify-center">
        <div className="relative flex flex-col items-center">
          {/* Pulsing ring animation */}
          <div className="absolute inset-0 rounded-full bg-[#d4af37]/10 animate-ping blur-sm w-16 h-16" />
          <img 
            src="https://res.cloudinary.com/dnhz6xwjz/image/upload/v1776840105/logo_ahkway.png" 
            alt="Loading..."
            className="w-16 h-16 object-contain relative z-10 drop-shadow-[0_4px_10px_rgba(214,175,55,0.3)] animate-pulse"
            referrerPolicy="no-referrer"
          />
          <p className="text-[10px] text-[#d4af37] font-black tracking-[0.2em] uppercase mt-6 animate-pulse">
            Authenticating Session...
          </p>
        </div>
      </div>
    );
  }

  if (!isLoginPage && (!user || !isAdmin)) {
    return (
      <div className="min-h-screen bg-[#050B14] flex flex-col items-center justify-center">
        <p className="text-[10px] text-[#d4af37] font-black tracking-[0.2em] uppercase">
          Redirecting to Login...
        </p>
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
