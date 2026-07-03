import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute({ children }: { children?: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
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

  if (!user || !isAdmin) {
    // Save current route for seamless redirection after success login
    return <Navigate to="/administrator/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
