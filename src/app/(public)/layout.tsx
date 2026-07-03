import PublicLayout from '@/components/layout/PublicLayout';
import React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PublicLayout>{children}</PublicLayout>;
}
